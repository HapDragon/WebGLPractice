function main() {
    var canvas=document.getElementById("example");
    if(!canvas){
        console.log('failed to retrieve the canvas element');
        return;

    }

    var ctx=canvas.getContext('2d');//2维是2d 3维是3d
    ctx.fillStyle='rgba(0,0,255,1)';
    ctx.fillRect(120,10,150,150);
}
