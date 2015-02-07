function Kaption(config) {
    var texts = [];
    var baseImage;
    var stage = new Kinetic.Stage({
        container: config.container,
        width: config.width,
        height: config.height
    });
    var containerRect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height()
    });
    var layer = new Kinetic.Layer();
    var imageLayer = new Kinetic.Layer();
    layer.add(containerRect);
    stage.add(imageLayer);
    stage.add(layer);
    stage.draw();

    function resizeStage(dimension) {
        stage.width(dimension.width);
        stage.height(dimension.height);
        containerRect.width(dimension.width);
        containerRect.height(dimension.height);
        stage.draw();
    }

    function addText(textConfig) {
        var kt = new KaptionText({
            bgColor: textConfig.bgColor,
            bgOpa: textConfig.bgOpa,
            text: textConfig.text,
            font: textConfig.font,
            fontSize: textConfig.fontSize,
            color: textConfig.color,
            onFocus: textConfig.onFocus,
            x: textConfig.x,
            y: textConfig.y
        });
        textConfig.onFocus(function () {
            kt.changeFocus(true);
            return kt;
        }());
    }

    function loadImage(imageUrl) {
        console.log("ajax upload:" + imageUrl);
        $.ajax({
            type: 'post',
            url: '../image',
            data: {
                url: imageUrl
            },
            success: function (upData) {
                console.log('tmp url: ' + upData.url);
                onUrl(upData.url);
            },
            error: function (error) {
                alert('Upload Failed');
            }
        });
    }

    function exportKaption(callback) {
        texts.forEach(function (t) {
            t.export();
        });
        stage.toDataURL({
            callback: function (url) {
                $.ajax({
                    type: 'post',
                    url: '../upload/image',
                    data: {
                        url: url
                    },
                    success: function (data) {
                        console.log(data);
                        callback(data.url);
                    },
                    error: function (error) {
                        alert('Upload Failed');
                    }
                })
            }
        });
    }

    function onUrl(imageUrl) {
        console.log("loaded image:" + imageUrl);
        console.log("stage width:" + stage.width());
        var imgObj = new Image();
        var adjustedDimension = {};
        imgObj.onload = function () {
            baseImage = new Kinetic.Image({
                x: 0,
                y: 0,
                width: stage.width(),
                height: imgObj.height * (stage.width() / imgObj.width),
                image: imgObj
            });
            adjustedDimension.width = stage.width();
            adjustedDimension.height = imgObj.height * (stage.width() / imgObj.width);
            stage.height(adjustedDimension.height);
            imageLayer.add(baseImage);
            imageLayer.draw();
            var group = new Kinetic.Group();
            var poly = new Kinetic.Line({
                points: [0, 0, 100, 0, 0, 100],
                fill: 'rgba(240, 0, 0, 0.6)',
                strokeWidth: 5,
                closed: true
            });

            var textMain = new Kinetic.Text({
                x: 10,
                y: 38,
                rotation: -45,
                text: 'KAPTION',
                fill: 'white',
                fontFamily: 'Six Caps',
                padding: 0,
                alignment: 'center',
                fontSize: 26
            });

            var textSub = new Kinetic.Text({
                x: 0,
                y: 32,
                rotation: -45,
                text: 'powered by',
                fill: 'white',
                padding: 5,
                fontSize: 8
            });
            //group.add(poly);
            //group.add(textMain);
            //group.add(textSub);
            // add the shape to the layer
            imageLayer.add(group);

            layer.draw();
            imageLayer.draw();
            config.onImageLoaded();
        };
        imgObj.src = imageUrl;
    }

    function KaptionText(kaptionTextConfig) {
        var kaptionText;
        var focused = false;
        var text = new Kinetic.Text({
            fontFamily: kaptionTextConfig.font,
            x: kaptionTextConfig.x,
            y: kaptionTextConfig.y,
            fill: kaptionTextConfig.color,
            fontSize: kaptionTextConfig.fontSize,
            text: kaptionTextConfig.text,
            align: 'center'
        });

        var x = kaptionTextConfig.x;
        var y = kaptionTextConfig.y;

        var bound = new Kinetic.Rect({
            x: x,
            y: y,
            width: text.width(),
            height: text.height(),
            strokeWidth: 1,
            stroke: 'red'
        });

        console.log("bgColor:" + kaptionTextConfig.bgColor);
        console.log("bgOpa:" + kaptionTextConfig.bgOpa);

        var bg = new Kinetic.Rect({
            x: x,
            y: y,
            width: text.width(),
            height: text.height(),
            fill: kaptionTextConfig.bgColor,
            opacity: kaptionTextConfig.bgOpa
        });

        var circle = new Kinetic.Circle({
            x: bound.x() + bound.width(),
            y: bound.y(),
            radius: 16,
            fill: 'white',
            stroke: 'white',
            strokeWidth: 4,
            draggable: false,
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x,
                    y: this.getAbsolutePosition().y
                }
            }
        });

        var zoomin = new Kinetic.Circle({
            x: bound.x() + bound.width(),
            y: bound.y() + bound.height(),
            radius: 16,
            fill: 'white',
            stroke: 'white',
            strokeWidth: 4,
            draggable: false
            /*dragBoundFunc: function (pos) {
             return {
             x: pos.x,
             y: this.getAbsolutePosition().y
             }
             }*/
        });

        var zoomout = new Kinetic.Circle({
            x: bound.x(),
            y: bound.getY() + bound.height(),
            radius: 16,
            fill: 'white',
            stroke: 'white',
            strokeWidth: 2,
            draggable: false
            /*dragBoundFunc: function (pos) {
             return {
             x: pos.x,
             y: this.getAbsolutePosition().y
             }
             }*/
        });

        zoomout.on("click", function () {
            textGroup.remove();
            layer.draw();
        });

        zoomout.on('mouseover touchstart', function () {
            this.strokeWidth(6);
            layer.draw();
            console.log("delete start");
        });

        zoomout.on('mouseleave touchend', function () {
            this.strokeWidth(2);
            layer.draw();
            console.log("delete end");
        });

        text.on("mouseover touchstart", function (e) {
            textGroup.draggable(true);
        });

        text.on("mouseleave touchend", function (e) {
            textGroup.draggable(false);
        });

        circle.on("mouseover touchstart", function (e) {
            expand = true;
            circle.draggable(true);
            circle.strokeWidth(6);
            layer.draw();
            console.log("start expanding");
            expand = true;
            //e.cancelBubble(true);
        });

        circle.on("mouseleave touchend", function (e) {
            expand = false;
            circle.strokeWidth(2);
            circle.draggable(false);
            layer.draw();
            console.log("end expanding");
            expand = false;
            //e.cancelBubble(true);
        });


        zoomin.on("mouseover touchstart", function (e) {
            this.strokeWidth(6);
            layer.draw();
            console.log("start zooming");
            zooming = true;
            //e.cancelBubble(true);
        });

        zoomin.on("mouseleave touchend", function (e) {
            zoomin.strokeWidth(2);
            layer.draw();
            console.log("end zooming");
            zooming = false;
            //e.cancelBubble(true);
        });

        zoomin.on('tap click', function () {
            console.log("appling zoom");
            zoomin.draggable(false);
            text.fontSize(text.fontSize() + 4);
            text.width(zoomin.getX() - text.getX());
            bound.width(text.width());
            bound.height(text.height());
            bg.width(text.width());
            bg.height(text.height());
            circle.x(bound.getX() + bound.width());
            circle.y(bound.getY());
            zoomin.x(bound.getX() + bound.width());
            zoomin.y(bound.getY() + bound.height());
            zoomout.x(bound.getX());
            zoomout.y(bound.getY() + bound.height());
            layer.draw();
        });
        var textGroup = new Kinetic.Group({
            draggable: false
        });
        textGroup.on("mouseleave", function () {
            if (focused) {
                return;
            }
            circle.hide();
            zoomin.hide();
            zoomout.hide();
            bound.hide();
            layer.draw();
        });


        textGroup.on('click tap', function () {
            var f = focused;
            texts.forEach(function (t) {
                console.log(t.setFocus(false));
            });
            focused = !f;
            console.log("clicked" + texts.length);
            if (focused) {
                bound.stroke('red');
                circle.fill('#2E9AFE');
                zoomin.fill('#2E9AFE');
                zoomout.fill('#2E9AFE');
                circle.show();
                zoomin.show();
                zoomout.show();
                bound.show();
            } else {
                bound.stroke('white');
                circle.fill('white');
                zoomin.fill('white');
                zoomout.fill('white');
                circle.show();
                zoomin.show();
                zoomout.show();
                bound.show();
            }
            layer.draw();
            kaptionTextConfig.onFocus(function () {
                return kaptionText;
            }());
        });

        textGroup.on("mouseover", function () {
            circle.show();
            zoomin.show();
            zoomout.show();
            bound.show();
            layer.draw();
        });
        textGroup.add(bg);
        textGroup.add(bound);
        textGroup.add(text);
        textGroup.add(circle);
        //textGroup.add(zoomin);
        //textGroup.add(zoomout);

        textGroup.on('touchmove dragmove', function (e) {
            //console.log(stage.getPointerPosition());
            //text.text(textGroup.x() + ', ' + textGroup.y() + ':' + line.points().length);

            if (!expand) {
                return;
            }
            //console.log(stage.getPointerPosition());
            var x;
            var y;
            // if (e.evt.touches) {
            //x = e.evt.touches[0].pageX;
            //y = e.evt.touches[0].pageY;
            //} else {
            //x = e.evt.pageX;
            //y = e.evt.pageY;
            //}
            x = circle.getX();
            y = circle.getY();
            zoomin.x(x);
            text.width(x - text.getX());
            //text.height(y - text.getAbsolutePosition().y);
            //text.text(prompt());
            bound.width(text.width());
            bound.height(text.height());
            bg.width(text.width());
            bg.height(text.height());
            zoomin.y(bound.getY() + bound.height());
            zoomin.x(bound.getX() + bound.width());
            zoomout.x(bound.getX());
            zoomout.y(bound.getY() + bound.height());
            //line.points(line.points().concat([x, y]));
            layer.draw();
            //e.bubbles
        });
        layer.add(textGroup);
        layer.draw();

        function changeSize(diff) {
            text.fontSize(text.fontSize() + diff);
            x = circle.getX();
            y = circle.getY();
            zoomin.x(x);
            text.width(x - text.getX());
            //text.height(y - text.getAbsolutePosition().y);
            //text.text(prompt());
            bound.width(text.width());
            bound.height(text.height());
            bg.width(text.width());
            bg.height(text.height());
            zoomin.y(bound.getY() + bound.height());
            zoomin.x(bound.getX() + bound.width());
            zoomout.x(bound.getX());
            zoomout.y(bound.getY() + bound.height());
            //line.points(line.points().concat([x, y]));
            layer.draw();
        }

        function setSize(size) {
            text.fontSize(size);
            x = circle.getX();
            y = circle.getY();
            zoomin.x(x);
            text.width(x - text.getX());
            //text.height(y - text.getAbsolutePosition().y);
            //text.text(prompt());
            bound.width(text.width());
            bound.height(text.height());
            bg.width(text.width());
            bg.height(text.height());
            zoomin.y(bound.getY() + bound.height());
            zoomin.x(bound.getX() + bound.width());
            zoomout.x(bound.getX());
            zoomout.y(bound.getY() + bound.height());
            //line.points(line.points().concat([x, y]));
            layer.draw();
        }

        function changeAlignment(alignment) {
            text.align(alignment);
            layer.draw();
        }

        function changeColor(color, opa) {
            console.log("changeColor:" + color + ":" + opa);
            text.fill(color);
            text.opacity(opa);
            layer.draw();
        }

        function changeText(newText) {
            text.text(newText);
            x = circle.getX();
            y = circle.getY();
            zoomin.x(x);
            text.width(x - text.getX());
            //text.height(y - text.getAbsolutePosition().y);
            //text.text(prompt());
            bound.width(text.width());
            bound.height(text.height());
            bg.width(text.width());
            bg.height(text.height());
            zoomin.y(bound.getY() + bound.height());
            zoomin.x(bound.getX() + bound.width());
            zoomout.x(bound.getX());
            zoomout.y(bound.getY() + bound.height());
            //line.points(line.points().concat([x, y]));
            layer.draw();
        }

        function changeBGColor(color, opa){
            bg.fill(color);
            bg.opacity(opa);
            layer.draw();
        }

        function changeFocus(focus) {
            focused = focus;
            if (focused) {
                bound.stroke('red');
                circle.fill('#2E9AFE');
                zoomin.fill('#2E9AFE');
                zoomout.fill('#2E9AFE');
                circle.show();
                zoomin.show();
                zoomout.show();
                bound.show();
            } else {
                bound.stroke('white');
                circle.fill('white');
                zoomin.fill('white');
                zoomout.fill('white');
                circle.show();
                zoomin.show();
                zoomout.show();
                bound.show();
            }
            layer.draw();
        }

        function changeFont(font) {
            text.fontFamily(font);
            x = circle.getX();
            y = circle.getY();
            zoomin.x(x);
            text.width(x - text.getX());
            //text.height(y - text.getAbsolutePosition().y);
            //text.text(prompt());
            bound.width(text.width());
            bound.height(text.height());
            bg.width(text.width());
            bg.height(text.height());
            zoomin.y(bound.getY() + bound.height());
            zoomin.x(bound.getX() + bound.width());
            zoomout.x(bound.getX());
            zoomout.y(bound.getY() + bound.height());
            //line.points(line.points().concat([x, y]));
            layer.draw();
        }

        function prepareExport() {
            console.log('prepare for export');
            bound.hide();
            circle.hide();
            zoomin.hide();
            zoomout.hide();
            layer.draw();
        }

        function removeKaption() {
            textGroup.remove();
            layer.draw();
        }

        function changeStroke(stroke) {
            text.shadowColor('black');
            layer.draw();
        }

        kaptionText = {
            changeSize: function (diff) {
                changeSize(diff);
            },
            setSize: function(size){
                setSize(size);
            },
            changeFont: function (font) {
                changeFont(font);
            },
            changeAlignment: function (align) {
                changeAlignment(align);
            },
            changeColor: function (color, opa) {
                changeColor(color, opa);
            },
            setFocus: function (focus) {
                changeFocus(focus);
            },
            getText: function () {
                return text.text();
            },
            getColor: function () {
                console.log("text.fill()=" + bg.fill());
                return text.fill();
            },
            getOpa: function () {
                return text.opacity();
            },
            getBGColor: function () {
                return bg.fill();
            },
            getBGOpa: function () {
                return bg.opacity();
            },
            changeText: function (text) {
                changeText(text);
            },
            export: function () {
                prepareExport();
            },
            remove: function () {
                removeKaption();
            },
            changeStoke: function (stroke) {
                changeStroke(stroke);
            },
            changeFocus: function(focus){
                changeFocus(focus);
            },
            changeBGColor: function(color, opa){
                changeBGColor(color, opa);
            }
        };
        texts.push(kaptionText);
        return kaptionText;
    }

    return {
        onWindowResize: function (dimension) {
            //resizeStage(dimension);
        },
        onAddText: function (textConfig) {
            addText(textConfig);
        },
        onAddImage: function (imageUrl) {
            loadImage(imageUrl);
        },
        getFocusedKaption: function () {

        },
        export: function (callback) {
            exportKaption(callback);
        },
        getDimention: function () {
            return {width: baseImage.width(), height: baseImage.height()};
        }
    };
}


