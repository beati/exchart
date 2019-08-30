package timezone

import (
	"testing"
	"time"
)

func BenchmarkLoadlocation(b *testing.B) {
	for n := 0; n < b.N; n++ {
		_, _ = LoadLocation("Europe/Paris")
	}
}

func BenchmarkTimeLoadlocation(b *testing.B) {
	for n := 0; n < b.N; n++ {
		_, _ = time.LoadLocation("Europe/Paris")
	}
}
