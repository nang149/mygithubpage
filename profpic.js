var SIDE_LENGTH = 550;

var canvasNode = document.getElementById('canvas');
canvasNode.width = SIDE_LENGTH;
canvasNode.height = SIDE_LENGTH;
canvasNode.style.border = "3px solid black";
canvasNode.addEventListener('mousedown', startDrag);
canvasNode.addEventListener('mousemove', dragImage);
canvasNode.addEventListener('mouseup', endDrag);

var downloadBtn = document.getElementById('btn-download');
downloadBtn.addEventListener('click', download);
document.getElementById('imageLoader').addEventListener('change', handleImage, false);

document.getElementById('scale').addEventListener('mousemove', scale);
document.getElementById('rot-r').addEventListener('click', rotateClockwise);
document.getElementById('rot-l').addEventListener('click', rotateCounterClockwise);

var canvasPic;

var bg = new Image();
bg.setAttribute('crossOrigin', 'anonymous');
bg.src = 'default.png';
var overlay = new Image();
overlay.setAttribute('crossOrigin', 'anonymous');
overlay.src = 'jnrs.png';    
overlay.onload = init;

function init() {
    canvasPic = {
        node: canvasNode,
        context: canvasNode.getContext('2d'),
        img: bg,
        imgX: 0,
        imgY: 0,
        imgScl: 1.0,
        width: function() {
            return this.img.width / this.img.height * SIDE_LENGTH * this.imgScl;
        },
        height: function() {
            return SIDE_LENGTH * this.imgScl;
        },
        imgRot: 0,
        draw: function() {
            this.context.clearRect(0, 0, SIDE_LENGTH, SIDE_LENGTH);
            // this.context.drawImage(bg, 0, 0, SIDE_LENGTH, SIDE_LENGTH);
            this.context.save();
            this.context.translate(SIDE_LENGTH / 2, SIDE_LENGTH / 2);
            this.context.rotate(this.imgRot * Math.PI / 180);
            this.context.drawImage(this.img, -SIDE_LENGTH / 2 + this.imgX, -SIDE_LENGTH / 2 + this.imgY, this.width(), this.height());
            this.context.restore();
            this.context.drawImage(overlay, 0, 0, SIDE_LENGTH, SIDE_LENGTH);
        },
        move: function(deltaX, deltaY) {
            if (this.imgRot == 0) {
                this.imgX += deltaX;
                this.imgY += deltaY;
            }
            if (this.imgRot == 90 || this.imgRot == -270) {
                this.imgX += deltaY;
                this.imgY -= deltaX;
            }
            if (this.imgRot == 180 || this.imgRot == -180) {
                this.imgX -= deltaX;
                this.imgY -= deltaY;
            }
            if (this.imgRot == 270 || this.imgRot == -90) {
                this.imgX -= deltaY;
                this.imgY += deltaX;
            }
        }
    };
}

function download() {
    downloadBtn.href = canvasPic.node.toDataURL('image/png');
    downloadBtn.download = '2018profile.png';
}
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}

function handleImage(e) {
    loadImage(e.target.files[0]);    
}

function loadImage(file) {
    var reader = new FileReader();
    reader.onload = (function() {
        return function(e) {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = (function() {
                return function() {
                    canvasPic.img = this;
                    canvasPic.draw();
                }
            })();
            img.src = e.target.result;
        };
    })();
    reader.readAsDataURL(file);
}

var mouse = {
    dragStarted: false,
    x: null,
    y: null,
    getNewCoords: function(e) {
        return {
            x: e.clientX,
            y: e.clientY
        };
    },
    updateCoords: function(x, y) {
        this.x = x;
        this.y = y;
    }
};

function startDrag(e) {
    mouse.dragStarted = true;
    coords = mouse.getNewCoords(e);
    mouse.updateCoords(coords.x, coords.y);
}

function endDrag(e) {
    mouse.dragStarted = false;
}

function dragImage(e) {
    if (mouse.dragStarted) {     
        newCoords = mouse.getNewCoords(e);
        canvasPic.move(newCoords.x - mouse.x, newCoords.y - mouse.y);
        mouse.updateCoords(newCoords.x, newCoords.y);
    }
    canvasPic.draw();
}

function scale(e) {
    canvasPic.imgScl = e.target.value;
    canvasPic.draw();
}

function rotate(direction) {
    canvasPic.imgRot += 90 * direction;
    canvasPic.imgRot %= 360;
    canvasPic.draw();
}

function rotateClockwise() {
    rotate(1);
}

function rotateCounterClockwise() {
    rotate(-1);
}
