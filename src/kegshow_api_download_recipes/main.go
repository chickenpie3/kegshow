package main

import (
	"bytes"
	"fmt"
	"strings"
	"net/http"
	"io/ioutil"
//  "context"
    "github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-sdk-go/service/s3"
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
)


type Token struct {
	Token string `json:"token"`
}


func HandleRequest(requestToken *Token) (string, error) {


	//TODO: get username, api key, api email from db using token

	url := "https://www.brewersfriend.com/homebrew/api/201309/myrecipes"

	payload := strings.NewReader("api_key=6335e0726e4e2aec6ec1bc136b45c6dbe781a071&api_email=boldbrews%40gmail.com")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Cache-Control", "no-cache")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()

	//We actually need to read everything before passing it to PutObject
	//because the Content-Length must be know (unless doing a multipart upload)
	body, err := ioutil.ReadAll(res.Body)

	if err != nil {
	    fmt.Println("failed to read response from brewersfriend")
	    fmt.Println(err)
    }

	// fmt.Println(res)
	// fmt.Println(string(body))

	fmt.Println("getting s3 client")

	s3client := s3.New(session.Must(session.NewSession()))

	fmt.Println("writing object")

	_, err = s3client.PutObject(&s3.PutObjectInput{
	    Body:                 bytes.NewReader(body),
	    Bucket:               aws.String("kegshow-recipes"),
	    Key:                  aws.String("username/brewersfriend/recipes.json"),
	})

	if err != nil {
        fmt.Println(err)
    }

	return "", nil
}

func main() {
    lambda.Start(HandleRequest)
}
