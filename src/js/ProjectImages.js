
var a = location.href;
var b = a.substring(a.indexOf("?")+1);
var project = b;
var group;
while (project.indexOf("%20") > -1) {
	project = project.replace("%20", " ");
}

window.onload = function() {
	document.getElementById("ImagePreview").addEventListener('click', FullScreenImage_Open);
	document.getElementById("FullScreenContainer").addEventListener('click', FullScreenImage_Close);
	document.body.addEventListener('mousemove', MouseMove)
	CreateImages();
	$("#ImageGrp").fadeIn(800);
}

var mX;
var mY;
function MouseMove(e) {
	mX = e.clientX;
	mY = e.clientY;
	document.getElementById("HoverName").style.left = mX + 20 + "px";
	document.getElementById("HoverName").style.top = mY + "px";
}

function UpdateImageEmail(imgname) {
	try { $("#UpdateImage").unbind("click"); }
	catch(err) {}
	$("#UpdateImage").on("click", function(e)
	{
		imgname = imgname.replace(" ","%20");
		$(this).attr('href', 'mailto:jmleach1987@hotmail.com?subject=Still image update request&body=Could you please update%0D%0A'+imgname);
    });
}

function CreateImages() {
	var pg = project.split("?");
	group = pg[0];
	project = pg[1];
	var ImageGrp = document.getElementById("ImageGrp");
	var ImagePreview = document.getElementById("ImagePreview");
	var PageTitle = document.getElementById("PageTitle");
	PageTitle.innerText = group + " - " + project;
	
	for (var i=0; i<pl.ProjectImages.length; i++)
		if (pl.ProjectImages[i].group != group || pl.ProjectImages[i].project != project) continue;
		var img = new Image();
		img.src = "../../uploads/imageprojects/" + pl.ProjectImages[i].imgName;
		img.className = "ProjectImages_Img";
		ImageGrp.appendChild(img);
		img.addEventListener('mouseover', ImageOver);
		img.addEventListener('mouseleave', ImageLeave);
		img.addEventListener('click', ImageClick);
}

function FileName(path) {
	var g = path.split("/");
	g = g[g.length-1];
	g = g.split(".")[0];
	return g;
}

function ImageOver(e) {
	var g = FileName(e.target.src);
	document.getElementById("HoverName").innerText = g;
	$("#HoverName").stop().fadeIn();
}

function ImageLeave(e) {
	$("#HoverName").stop().fadeOut(200);
}

function ImageClick(e) {
	$("#ImagePreview, #FullImageName, #UpdateImage").show();
	var ImagePreview = document.getElementById("ImagePreview");
	ImagePreview.style.backgroundImage = "url('" + e.target.src + "')";
	var g = FileName(e.target.src);
	$("#FullImageName").fadeIn();
	document.getElementById("FullImageName").innerText = g;
	UpdateImageEmail(e.target.src);
}

function FullScreenImage_Open(e) {
	var g = e.target.style.backgroundImage;
	document.getElementById("FullScreenImage").style.backgroundImage = g;//"url("+  +")";
	$("#FullScreenContainer").fadeIn();
}
function FullScreenImage_Close(e) {
	$("#FullScreenContainer").fadeOut();
}