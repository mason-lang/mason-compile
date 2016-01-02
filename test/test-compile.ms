import
	msl.io.time $sleep
	..tests

tests 'time
	$sleep -> $!|
		t0 = Date.now()
		$ $sleep 1000
		t1 = Date.now()
		assert >=? (- t1 t0) 999
