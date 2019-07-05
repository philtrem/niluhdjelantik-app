package inventory

import (
	"os"
	"strconv"
	"log"
)

func writeImage(data []byte) {
	id := getLastId() // used to name and link image files
	f, e := os.Create("./inventory/images/" + strconv.Itoa(id) + ".jpg")
	if e != nil {
		log.Println("WriteImage: Create File ", e)
	}
	defer f.Close()
	_, e = f.Write(data)
	if e != nil {
		log.Println("WriteImage: Write Data to File ", e)
	}
}