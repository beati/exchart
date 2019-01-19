// +build dev

package data

import "net/http"

// Files is a http.FileSystem that contains static assets of the application client.
var Files = http.Dir("budget-client/dist/budget-client")
