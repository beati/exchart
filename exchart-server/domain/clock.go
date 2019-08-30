package domain

import "time"

// A Clock interface is used to retrieve current time.
type Clock interface {
	Now() time.Time
}
