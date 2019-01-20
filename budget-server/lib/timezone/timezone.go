package timezone

import (
	"errors"
	"sync"
	"time"
)

var mu sync.RWMutex
var cache = map[string]*time.Location{}
var errEmpty = errors.New("timezone: empty name")

// LoadLocation returns the Location with the given name.
func LoadLocation(name string) (*time.Location, error) {
	if name == "" {
		return nil, errEmpty
	}

	mu.RLock()
	loc, ok := cache[name]
	mu.RUnlock()
	if ok {
		return loc, nil
	}

	loc, err := time.LoadLocation(name)
	if err != nil {
		return nil, err
	}

	mu.Lock()
	cache[name] = loc
	mu.Unlock()

	return loc, nil
}
