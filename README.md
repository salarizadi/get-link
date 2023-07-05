## How it works?
This library helps you to get all the links like (file, image, video, web pages, etc.) by fetching and collecting data with [ReadableStream](https://github.com/salarizadi/get-link/blob/073fe8d4a9bb63b947a80a4014f54c0f64e297d9/get.js#L63) and convert the data into Blob link.

## Example
```js
"Link".get({
    removeURL: false, // Delete Blob after creating it? default (true)
    encode: false, // If it is equal to false, it does not save the file with the format, it just creates an unformatted file from the data of that file
    started() {
        console.log("Start")
    },
    progress: function (percent) {
        console.log(percent)
        if (percent >= 30 && percent < 90)
            this.stop()
    },
    success: url => {
        console.log(url)
    },
    failed: (type, message) => {
        console.error(type + ", ", message)
    }
})
```

### this.stop
This function makes it save any percentage of downloaded data, for example, you want to download an image, but you want only 30% of that image to be downloaded, for this you use this function.

## Demo of the download image
<span>30%
  <img src="https://github.com/salarizadi/get-link/assets/67143370/4b2a3b03-8811-4f98-aa92-913071156507" width="300">
</span>
<span>100%
  <img src="https://github.com/salarizadi/get-link/assets/67143370/19e99521-dc6a-45eb-97cf-ced63e136549" width="300">
</span>
