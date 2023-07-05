/**
 *  Copyright (c) 2023
 *  @Version    : 1.0.0
 *  @Repository : https://github.com/salarizadi/get-link
 *  @Author     : https://salarizadi.github.io
 *
 * "Link".get({
 *     removeURL: false,
 *     encode: false,
 *     started() {
 *         console.log("Start")
 *     },
 *     progress: function (percent) {
 *         console.log(percent)
 *         if (percent >= 30 && percent < 90)
 *             this.stop()
 *     },
 *     success: url => {
 *         console.log(url)
 *     },
 *     failed: (type, message) => {
 *         console.error(type + ", ", message)
 *     }
 * })
 */

String.prototype.get = async function ( options = {} ) {
    if ( typeof options !== "object" )
        throw "Options must be objects";

    const Options = {
        removeURL : true,
        encode    : false,
        started ( ) {},
        progress ( percent ) {},
        success ( url ) {},
        stop ( ) {
            this.stopped = true
        },
        failed ( type, message ) {},
        ...options,
        link : this
    }, _URL_ = URL || webkitURL;

    if (!(
        window.fetch && window.ReadableStream && window.Blob
    )) return Options.failed("support", "This browser not support")

    try {
        let Request       = await fetch(Options.link);
        let ContentLength = Request.headers.get('content-length');
        let ContentType   = Request.headers.get('content-type');

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
                if ( !Options.encode ) result = new Blob([result], {
                    type: ContentType
                });
                Options.success(result = _URL_.createObjectURL(result));
                if ( Options.removeURL )
                    _URL_.revokeObjectURL(result)
            } catch ( e ) {
                Options.failed("blob", "Failed to createObjectURL")
            }
        }).catch(reason => Options.failed("blob", reason));
    } catch ( e ) {Options.failed(e.name, e)}
};