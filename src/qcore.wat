;; The quantum core of Qubit Quest, hand-written in WebAssembly text (the web's assembler).
;; It holds one state vector and applies gates to it, like src/sim.js, which stays the
;; reference: test/core.test.js checks this core against it (and so against Qiskit).
;;
;; Memory: amplitude i is two f64 at byte 16*i: real part, then imaginary part.
;; Qubit q is bit (n-1-q) of the index: qubit 0 is the LEFT digit of a ket.
;; Up to 12 qubits (4096 amplitudes = 64 KiB, one page).
(module
  (memory (export "memory") 1)
  (global $n (mut i32) (i32.const 0))
  (global $dim (mut i32) (i32.const 1))

  ;; set the number of qubits, keep the memory as it is (for loading a state)
  (func $set_n (export "set_n") (param $n i32)
    (global.set $n (local.get $n))
    (global.set $dim (i32.shl (i32.const 1) (local.get $n))))

  ;; n qubits, all in |0>
  (func (export "init") (param $n i32)
    (call $set_n (local.get $n))
    (memory.fill (i32.const 0) (i32.const 0) (i32.shl (global.get $dim) (i32.const 4)))
    (f64.store (i32.const 0) (f64.const 1)))

  (func $mask (param $q i32) (result i32)
    (i32.shl (i32.const 1) (i32.sub (i32.sub (global.get $n) (i32.const 1)) (local.get $q))))

  ;; swap amplitudes i and j
  (func $swap_amps (param $i i32) (param $j i32)
    (local $a i32) (local $b i32) (local $re f64) (local $im f64)
    (local.set $a (i32.shl (local.get $i) (i32.const 4)))
    (local.set $b (i32.shl (local.get $j) (i32.const 4)))
    (local.set $re (f64.load (local.get $a)))
    (local.set $im (f64.load offset=8 (local.get $a)))
    (f64.store (local.get $a) (f64.load (local.get $b)))
    (f64.store offset=8 (local.get $a) (f64.load offset=8 (local.get $b)))
    (f64.store (local.get $b) (local.get $re))
    (f64.store offset=8 (local.get $b) (local.get $im)))

  ;; a one-qubit gate [a b; c d] (complex entries) on qubit q
  (func (export "apply1") (param $q i32)
      (param $ar f64) (param $ai f64) (param $br f64) (param $bi f64)
      (param $cr f64) (param $ci f64) (param $dr f64) (param $di f64)
    (local $m i32) (local $i i32) (local $pi i32) (local $pj i32)
    (local $xr f64) (local $xi f64) (local $yr f64) (local $yi f64)
    (local.set $m (call $mask (local.get $q)))
    (local.set $i (i32.const 0))
    (block $done
      (loop $next
        (br_if $done (i32.ge_u (local.get $i) (global.get $dim)))
        (if (i32.eqz (i32.and (local.get $i) (local.get $m)))
          (then
            (local.set $pi (i32.shl (local.get $i) (i32.const 4)))
            (local.set $pj (i32.shl (i32.or (local.get $i) (local.get $m)) (i32.const 4)))
            (local.set $xr (f64.load (local.get $pi)))
            (local.set $xi (f64.load offset=8 (local.get $pi)))
            (local.set $yr (f64.load (local.get $pj)))
            (local.set $yi (f64.load offset=8 (local.get $pj)))
            ;; new x = a*x + b*y
            (f64.store (local.get $pi)
              (f64.add
                (f64.sub (f64.mul (local.get $ar) (local.get $xr)) (f64.mul (local.get $ai) (local.get $xi)))
                (f64.sub (f64.mul (local.get $br) (local.get $yr)) (f64.mul (local.get $bi) (local.get $yi)))))
            (f64.store offset=8 (local.get $pi)
              (f64.add
                (f64.add (f64.mul (local.get $ar) (local.get $xi)) (f64.mul (local.get $ai) (local.get $xr)))
                (f64.add (f64.mul (local.get $br) (local.get $yi)) (f64.mul (local.get $bi) (local.get $yr)))))
            ;; new y = c*x + d*y
            (f64.store (local.get $pj)
              (f64.add
                (f64.sub (f64.mul (local.get $cr) (local.get $xr)) (f64.mul (local.get $ci) (local.get $xi)))
                (f64.sub (f64.mul (local.get $dr) (local.get $yr)) (f64.mul (local.get $di) (local.get $yi)))))
            (f64.store offset=8 (local.get $pj)
              (f64.add
                (f64.add (f64.mul (local.get $cr) (local.get $xi)) (f64.mul (local.get $ci) (local.get $xr)))
                (f64.add (f64.mul (local.get $dr) (local.get $yi)) (f64.mul (local.get $di) (local.get $yr)))))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $next))))

  ;; flip the target t where every control bit in `controls` is 1
  (func $controlled_x (param $controls i32) (param $t i32)
    (local $mt i32) (local $i i32)
    (local.set $mt (call $mask (local.get $t)))
    (local.set $i (i32.const 0))
    (block $done
      (loop $next
        (br_if $done (i32.ge_u (local.get $i) (global.get $dim)))
        (if (i32.and
              (i32.eq (i32.and (local.get $i) (local.get $controls)) (local.get $controls))
              (i32.eqz (i32.and (local.get $i) (local.get $mt))))
          (then (call $swap_amps (local.get $i) (i32.or (local.get $i) (local.get $mt)))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $next))))

  (func (export "cx") (param $c i32) (param $t i32)
    (call $controlled_x (call $mask (local.get $c)) (local.get $t)))

  (func (export "ccx") (param $c1 i32) (param $c2 i32) (param $t i32)
    (call $controlled_x (i32.or (call $mask (local.get $c1)) (call $mask (local.get $c2))) (local.get $t)))

  ;; multiply the amplitudes where qubits a and b are both 1 by (pr + i pi): CZ, CS, CS-dagger
  (func (export "cphase") (param $a i32) (param $b i32) (param $pr f64) (param $pi f64)
    (local $both i32) (local $i i32) (local $p i32) (local $re f64) (local $im f64)
    (local.set $both (i32.or (call $mask (local.get $a)) (call $mask (local.get $b))))
    (local.set $i (i32.const 0))
    (block $done
      (loop $next
        (br_if $done (i32.ge_u (local.get $i) (global.get $dim)))
        (if (i32.eq (i32.and (local.get $i) (local.get $both)) (local.get $both))
          (then
            (local.set $p (i32.shl (local.get $i) (i32.const 4)))
            (local.set $re (f64.load (local.get $p)))
            (local.set $im (f64.load offset=8 (local.get $p)))
            (f64.store (local.get $p)
              (f64.sub (f64.mul (local.get $pr) (local.get $re)) (f64.mul (local.get $pi) (local.get $im))))
            (f64.store offset=8 (local.get $p)
              (f64.add (f64.mul (local.get $pr) (local.get $im)) (f64.mul (local.get $pi) (local.get $re))))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $next))))

  ;; exchange qubits a and b
  (func (export "swap") (param $a i32) (param $b i32)
    (local $ma i32) (local $mb i32) (local $i i32)
    (local.set $ma (call $mask (local.get $a)))
    (local.set $mb (call $mask (local.get $b)))
    (local.set $i (i32.const 0))
    (block $done
      (loop $next
        (br_if $done (i32.ge_u (local.get $i) (global.get $dim)))
        ;; each pair once: a set, b clear
        (if (i32.and
              (i32.ne (i32.and (local.get $i) (local.get $ma)) (i32.const 0))
              (i32.eqz (i32.and (local.get $i) (local.get $mb))))
          (then (call $swap_amps (local.get $i) (i32.xor (i32.xor (local.get $i) (local.get $ma)) (local.get $mb)))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $next))))
)
