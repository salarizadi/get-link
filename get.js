/**
 *  Copyright (c) 2023
 *  @Version    : 1.5.0
 *  @Repository : https://github.com/salarizadi/get-link
 *  @Author     : https://salarizadi.github.io
 *
 * "Link".get({
 *     fetch      : {
 *        // fetch init options
 *     },
 *     removeBlob : false, // Delete Blob after creating it? default (true)
 *     encode     : false, // If it is equal to false, it does not save the file with the format, it just creates an unformatted file from the data of that file
 *     size       : 0,  // content-length if not found in header
 *     type       : "", // content-type if not found in header
 *     started    : function ( ) {
 *         console.log("Start")
 *     },
 *     progress: function ( percent ) {
 *         console.log(percent)
 *         if (percent >= 30 && percent < 90)
 *             this.stop()
 *     },
 *     success: function ( url ) {
 *         console.log(url)
 *         this.remove() // Delete the generated blob
 *     },
 *     failed: function ( type, message ) {
 *         console.error(type + ", ", message)
 *     }
 * })
 */

String.prototype.get = async function ( options = {} ) {
    if ( typeof options !== "object" )
        throw "Options must be objects";

    const _URL_   = URL || webkitURL;
    const Options = {
        fetch      : {},
        removeBlob : true,
        encode     : false,
        size       : 0,
        type       : false,
        started ( ) {},
        progress ( percent ) {},
        success ( url ) {},
        remove ( ) {
            if ( this.blob )
                return _URL_.revokeObjectURL(this.blob)
        },
        stop ( ) {
            this.stopped = true
        },
        failed ( type, message ) {},
        ...options,
        link : this
    };

    if (!(
        fetch && Response && ReadableStream && Blob
    )) return Options.failed("support", "This browser not support")

    try {
        let Request       = await fetch(Options.link, typeof options.fetch === "object" ? options.fetch : {});
        let ContentLength = Request.headers.get('content-length') ?? options.size;
        let ContentType   = Request.headers.get('content-type') ?? options.type;

        if ( !ContentLength )
            return Options.failed("headers", "Not found content-length in headers");

        if ( !ContentType )
            return Options.failed("headers", "Not found content-type in headers");

        let Total  = parseInt(ContentLength, 10);
        let Loaded = 0;

        new Response(new ReadableStream({
            async start ( controller ) {
                const reader = Request.body.getReader(); Options.started();
                for (; ;) {
                    if ( Options.stopped ) {
                        reader.cancel().then(r => controller.close()).catch(reason =>
                            Options.failed("stopped", "Request to stop download failed")
                        )
                        return Promise.resolve()
                    }
                    const {done, value} = await reader.read();
                    if (done) break; Loaded += value.byteLength;
                    Options.progress(Math.round(Loaded / Total * 100));
                    controller.enqueue(value);
                } controller.close()
            }
        })).blob().then(result => {
            try {
                if ( Options.encode ) result = new Blob([result], {
                    type: ContentType
                });
                Options.success(options.blob = _URL_.createObjectURL(result));
                if ( Options.removeBlob )
                    _URL_.revokeObjectURL(options.blob)
            } catch ( e ) {
                Options.failed("blob", e)
            }
        }).catch(reason => Options.failed("blob", reason));
    } catch ( e ) {Options.failed(e.name, e)}
};
