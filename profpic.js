var SIDE_LENGTH = 550;

var canvasNode = document.getElementById('canvas');
canvasNode.width = SIDE_LENGTH;
canvasNode.height = SIDE_LENGTH * 1.5;
canvasNode.style.border = "3px solid black";
canvasNode.addEventListener('mousedown', startDrag);
canvasNode.addEventListener('mousemove', dragImage);
canvasNode.addEventListener('mouseup', endDrag);

var downloadBtn = document.getElementById('btn-download');
downloadBtn.addEventListener('click', download);
// document.getElementById('btn-update').addEventListener('click', uploadToFacebook);
document.getElementById('imageLoader').addEventListener('change', handleImage, false);
// document.getElementById('btn-getCurrent').addEventListener('click', getFBProfPic);

document.getElementById('scale').addEventListener('mousemove', scale);
document.getElementById('rot-r').addEventListener('click', rotateClockwise);
document.getElementById('rot-l').addEventListener('click', rotateCounterClockwise);

var canvasPic;

var bg = new Image();
bg.setAttribute('crossOrigin', 'anonymous');
bg.src = 'default.png';
var overlay = new Image();
overlay.setAttribute('crossOrigin', 'anonymous');
overlay.src = 'overlay.png';    
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
            this.context.drawImage(overlay, 0, 0, SIDE_LENGTH, SIDE_LENGTH * 1.5);
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
    downloadBtn.download = 'profile.png';
}

/*function getFBProfPic() {
    FB.login(function(response) {
        FB.api('me/picture?redirect=1&width=' + SIDE_LENGTH, function(response) {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = (function() {
                return function() {
                    canvasPic.img = this;
                    canvasPic.draw();
                }
            })();
            img.src = response.data.url;
        });
    });
}
function uploadToFacebook() {
    var blob = dataURItoBlob(canvasPic.node.toDataURL('image/png'));
    FB.login(function(response) {
        var aid;
        var access_token = response.authResponse.accessToken;
        var data = new FormData();
        data.append('access_token', access_token);
        data.append('source', blob);
        data.append('no_story', true);
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var pid = JSON.parse(this.response).id;
            window.open('https://www.facebook.com/photo.php?fbid=' + pid + '&makeprofile=1&makeuserprofile=1', '_blank');
        }
        
        FB.api('me/albums', function(response) {
            var albums = response.data;
            for (var i = 0; i < albums.length; i++) {
                if (albums[i].name == "Custom Profile Pictures") {
                    aid = albums[i].id;
                    xhr.open('POST', 'https://graph.facebook.com/' + aid + '/photos?access_token=' + access_token);
                    xhr.send(data);
                }
            }
            if (!aid) {
                FB.api('me/albums', 'POST', 
                    {'name': 'Custom Profile Pictures'}, function(response) {
                    aid = response.id;
                    xhr.open('POST', 'https://graph.facebook.com/' + aid + '/photos?access_token=' + access_token);
                    xhr.send(data);
                });
            }
        });
    }, {scope: 'user_photos,publish_actions'});
}*/

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
$('a[href^="#"]').on('click', function(event) {

    var target = $(this.getAttribute('href'));

    if( target.length ) {
        event.preventDefault();
        $('html, body').stop().animate({
            scrollTop: target.offset().top
        }, 1000);
    }

});
