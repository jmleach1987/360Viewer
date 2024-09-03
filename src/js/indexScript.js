import { DomeProjectData } from '../../uploads/360Projects/DomeProjectsDataList.js';
import { imageBarList } from './imageBarList.js';
			

class indexScript {
	constructor(object) {

		const uploadLoc = "../../uploads";
		let selectedGroup;
		
		let groups = []; // Project List (dome/image) Groups

		

		function baseName(str)
		{
		   let base = new String(str).substring(str.lastIndexOf('/') + 1); 
			if(base.lastIndexOf(".") != -1)       
				base = base.substring(0, base.lastIndexOf("."));
		   return base;
		}


		function GroupSelection_Click(link){
			$("#Choose").hide();
			if ($(link)[0].className == "groupLinkselected") return;
			
			for (let i=0; i<$(".groupLinkselected").length; i++) {
				$(".groupLinkselected")[i].className = "groupLinks";
			}
			$(link)[0].className = "groupLinkselected";

			let tmp = [];
			tmp.push.apply(tmp, DomeProjectData);
			//tmp.push.apply(tmp, pl.ProjectImages);
			
			for (let i=0; i<tmp.length; i++) {
				let group = tmp[i].group;
				let project = tmp[i].project;
				let g = document.getElementById("projectLink_" + group + "_" + project);
				let h = document.getElementById("projectImageLink_" + group + "_" + project);
				if (tmp[i].group == link.id) {
					$(g).show();
					$(h).show();
				} else {
					$(g).hide();
					$(h).hide();
				}
			}
		}

		function AddProjectGroup(group) {
			if (groups.indexOf(group)<=-1) {
				let li = document.createElement("li");
				let a = document.createElement("a");
				a.href = "#";
				a.innerText = group;
				a.className = "groupLinks";
				li.appendChild(a);
				a.id = group;
				document.getElementById("ProjectGroupList").appendChild(li);
				a.addEventListener('click', function(){ GroupSelection_Click(this);});
				groups.push(group);
			}
		}

		function headerLink_Click(link) {
			if ($(link)[0].className == "headerLinkselected") return;
			
			for (let i=0; i<$(".headerLinkselected").length; i++) {
				$(".headerLinkselected")[i].className = "headerLinks";
			}
			$(link)[0].className = "headerLinkselected";
			
			$("#SERVICES:visible, #PROJECTS:visible, #ABOUT:visible, #CONTACT:visible, #TECHNOLOGY:visible").fadeOut(200, function() {
				switch ($(link)[0].innerText) {
					case "Services":
						//$("#BG:visible").fadeOut(200, function() {
						//	let loc = "url(src/img/ProjectLinkBackground.png)";
						//	document.getElementById("BG").style.backgroundImage = loc;
						//	$("#BG:hidden").fadeTo(400, 0.22);
						//});
						$("#SERVICES:hidden").fadeIn(500, function() {
							console.log("Services");
						});
						break;
					case "Projects":
						//$("#BG:visible").fadeOut(200, function() {
						//	let loc = "url(src/img/ProjectLinkBackground.png)";
						//	document.getElementById("BG").style.backgroundImage = loc;
						//	$("#BG:hidden").fadeTo(400, 0.22);
						//});
						$("#PROJECTS:hidden").fadeIn(500, function() {
							console.log("Projects");
						});
						break;
					case "Technology":
						//$("#BG:visible").fadeOut(200, function() {
						//	let loc = "url(src/img/roundlight.PNG)";
						//	document.getElementById("BG").style.backgroundImage = loc;
						//	$("#BG:hidden").fadeTo(400, 0.08);
						//});
						$("#TECHNOLOGY:hidden").fadeIn(500, function() {
							console.log("Technology");
						});
						break;
					case "About the Team":
						//$("#BG:visible").fadeOut(200, function() {
						//	let loc = "url(src/img/AboutBackground.png)";
						//	document.getElementById("BG").style.backgroundImage = loc;
						//	$("#BG:hidden").fadeTo(400, 0.22);
						//});
						$("#ABOUT:hidden").fadeIn(500, function() {
							console.log("About");
						});
						break;
					case "Contact":
						//$("#BG:visible").fadeOut(200, function() {
						//	let loc = "url(src/img/ContactBackground.png)";
						//	document.getElementById("BG").style.backgroundImage = loc;
						//	$("#BG:hidden").fadeIn(200);
						//});
						$("#CONTACT:hidden").fadeIn(500, function() {
							console.log("Contact");
						});
						break;
				}
			});
		}


		
		let imgbar_imgtoload = [];
		function LoadimgBarLoop() {
			if (imgbar_imgtoload.length == 0) return;
			let image = new Image();
			image.src = imgbar_imgtoload[0];
			image.onload = function() {
				
				let img = document.createElement("img");
				img.src = image.src;
				img.addEventListener('click', function(){ FullScreenImage_Open(this); });
				document.getElementById("ImageBarDiv").appendChild(img);
				
				$(img).show();
				
				imgbar_imgtoload.splice(0, 1);
				LoadimgBarLoop();
			}
		}
		function LoadImageBar() {
			if ($("#ImageBarDiv").children().length != 0) return;
			
			for (let i=0; i<imageBarList.length; i++) {
				let s = "../../uploads/imageBar/" + imageBarList[i];
				imgbar_imgtoload.push(s);
			}
			LoadimgBarLoop();
		}
		




		function ImageBar_RightButton_Click(){
			// restrict from going to far right
			let goal = 0;
			for (let i=0; i<$("#ImageBarDiv").children().length; i++) {
				let img = $("#ImageBarDiv").children()[i];
				if (window.innerWidth <= img.offsetLeft + img.offsetWidth + $("#ImageBarDiv").offset().left){
					goal = img.offsetLeft;
					break;
				}
			}
			$("#ImageBarDiv").animate({left: -goal + "px"}, 800);
		}
		function ImageBar_LeftButton_Click(){
			let goal = 0;
			for (let i=0; i<$("#ImageBarDiv").children().length; i++) {
				let img = $("#ImageBarDiv").children()[i];
				if (img.offsetLeft+img.offsetWidth + $("#ImageBarDiv").offset().left<=0){
					goal = img.offsetLeft;
					break;
				}
			}
			$("#ImageBarDiv").animate({left: goal + "px"}, 800);
		}


		function FullScreenImage_Open(img) {
			$("#FullScreenVideo").hide();
			let fsi = document.getElementById("FullScreenImage");
			fsi.style.backgroundImage = "url(" + img.src + ")";
			fsi.style.display = "block";
			$("#FullScreenContainer").fadeIn();
		}
		function FullScreenImage_Close() {
			$("#FullScreenContainer").fadeOut();
			document.getElementById("FullScreenVideo").pause();
		}
		function FullScreenVideo_Open(vid) {
			$("#FullScreenImage").hide();
			$("#FullScreenVideo").show();
			document.getElementById("FullScreenVideo_source").src = vid;
			document.getElementById("FullScreenVideo").load();
			document.getElementById("FullScreenVideo").play(); // autoplay doesn't work
			$("#FullScreenContainer").fadeIn();
		}


		//let assoc_imgtoload = [];
		
		/*
		function LoadAssocPicLoop() {
			if (assoc_imgtoload.length == 0) return;
			let image = new Image();
			image.src = "src/img/TeamPhotos/" + assoc_imgtoload[0].image;
			
			let superimage = new Image();
			let s = image.src;
			s = s.replace(".png", "_super.png");
			superimage.src = s;
			
			image.onload = function() {
				
				let d = document.createElement("div");
				let img = document.createElement("img");
				img.src = image.src;
				img.className = "AssocPics_small";
				img.addEventListener('click', function(){ AssocPic_Click(this); });
				img.addEventListener('mouseover', function(){ AssocPic_Hover(this); });
				img.addEventListener('mouseleave', function(){ AssocPic_Leave(this); });
				d.appendChild(img);
				let nm = document.createElement("p");
				nm.innerText = assoc_imgtoload[0].name;
				nm.className = "AssocPics_nmtext";
				d.appendChild(nm);
				
				assoc_imgtoload.splice(0, 1);
				LoadAssocPicLoop();
				
				document.getElementById("assocthumbs").appendChild(d);
				$(img).show();
				
			}
		}
		*/
		/*
		let assocImageDict = {};
		function LoadAssocPics() {
			
			if ($("#assocthumbs").children().length != 0) return;
			
			for (let i=0; i<apic.assocList.length; i++) {
				let s = apic.assocList[i];
				assoc_imgtoload.push(s);
				assocImageDict[baseName(s.image)] = s;
			}
			LoadAssocPicLoop();
			
		}
		*/

		/*
		function AssocPic_Click(img) {
			let src = img.src.replace("_super.png", ".png")
			let idnm = baseName(src);
			let assocObj = assocImageDict[idnm];
			
			$("#AboutContainer div, #AboutContainer ul").fadeOut( function() {
				$("#AboutContainer div")[0].innerHTML = "<h1>"+assocObj.name+"</h1><i><h3>"+assocObj.title+"</h3></i></br>"+assocObj.bio;
				$("#AboutContainer div").fadeIn();
			});
			
			$("#SelectedAssocImage")[0].src = src;
			$("#assocthumbs").stop().fadeOut({ queue: false, duration: 500 }, 'linear');
			$("#SelectedAssoc").stop().fadeIn({ queue: false, duration: 500 }, 'linear');
			
			aligncloseonassocpic();
		}
		function AssocPic_Hover(img) {
			img.src = img.src.replace(".png", "_super.png");
		}
		function AssocPic_Leave(img) {
			img.src = img.src.replace("_super.png", ".png");
		}
		function aligncloseonassocpic() {
			let m = $("#SelectedAssocImage")[0].offsetLeft - $(".closeButton").innerWidth() - 5;
			m += $("#SelectedAssocImage")[0].width;
			let t = $("#SelectedAssocImage")[0].offsetTop + 5;// - ($(".closeButton").innerHeight());
			$("#AssocImageClose").css({
				right: "auto",
				left: m,
				top: t,
			});
		}
		function AssocImage_Close() {
			
			$("#AboutContainer div").fadeOut( function() {
				$("#AboutContainer div")[0].innerHTML = apic.teambio;
				$("#AboutContainer div, #AboutContainer ul").fadeIn();
			});
			
			$("#assocthumbs").stop().fadeIn({ queue: false, duration: 500 }, 'linear');
			$("#SelectedAssoc").stop().fadeOut({ queue: false, duration: 500 }, 'linear');
		}
		*/

		function ResizeProjectList() {
			//aligncloseonassocpic();
		}


		this.START = function() {
						
			for (let i=0; i<DomeProjectData.length; i++) {
						
				// make the project private
				if (DomeProjectData[i].dataFile.includes("_private")) { continue; }
			
				let group = DomeProjectData[i].group;
				let project = DomeProjectData[i].project;
				
				AddProjectGroup(group);
				
				let g = group + "?" + project;
				while (g.indexOf(" ") > -1) {
					g = g.replace(" ", "%20");
				}
				
				let li = document.createElement("li");
				li.className = "projectLinks";
				li.id = "projectLink_"+ group + "_" + project;
				let a = document.createElement("a");
				a.href = "Dome.html?" + g;
				a.innerText = project;
				li.appendChild(a);
				document.getElementById("ProjectList").appendChild(li);
			}
			
			
			// ProjectImages
			/*
			for (let i=0; i<pl.ProjectImages.length; i++) {
				let group = pl.ProjectImages[i].group;
				let project = pl.ProjectImages[i].project;
				
				AddProjectGroup(group);
				
				let g = group + "?" + project;
				while (g.indexOf(" ") > -1) {
					g = g.replace(" ", "%20")
				}
				let li = document.createElement("li");
				li.className = "projectLinks";
				li.id = "projectImageLink_" + group + "_" + project;
				let a = document.createElement("a");
				a.href = "ProjectImages.html?" + g;
				a.innerText = project;
				li.appendChild(a);
				document.getElementById("ProjectImageList").appendChild(li);
			}
			*/
			/*
			for (i=0; i < apic.assocList.length; i++) {
				let d = document.createElement("div");
				let obj = apic.assocList[i];
				//"mailto:?subject=look at this website&body=Hi,I found this website and thought you might like it http://www.geocities.com/wowhtml/"
				d.innerHTML = "<p><span style=\"font-size:1.4em\"><b>"+obj.name+"</b></span></br><a href=\"mailto:"+obj.email+"?subject=Question for the 3D Team\">"+obj.email+"</a></br><a href=\"tel:"+obj.phone+"\">"+obj.phone+"</a></p>";
				document.getElementById("ContactInfo").appendChild(d);
			}
			*/
			
			
			
			//$("#AboutContainer div")[0].innerHTML = apic.teambio;
			
			document.getElementById("ImageBar_RightButton").addEventListener('click', ImageBar_RightButton_Click);
			document.getElementById("ImageBar_LeftButton").addEventListener('click', ImageBar_LeftButton_Click);
			
			//document.getElementById("AssocImageClose").addEventListener('click', AssocImage_Close);
			//document.getElementById("SelectedAssocImage").addEventListener('click', AssocImage_Close);
			
			//document.getElementById("FullScreenContainer").addEventListener('click', FullScreenImage_Close);
			
			//document.getElementById("TeamLocationButton").addEventListener('click', function(){
			//	FullScreenImage_Open($("#TeamLocationButton img")[0]);
			//});
			//document.getElementById("VRLocationButton").addEventListener('click', function(){
			//	FullScreenImage_Open($("#VRLocationButton img")[0]);
			//});
			
			//document.getElementById("VideoButton1").addEventListener('click', function(){
			//	FullScreenVideo_Open(uploadLoc + "video/FullPromo_30fps_1080.mp4");
			//});
			//document.getElementById("VideoButton2").addEventListener('click', function(){
			//	FullScreenVideo_Open(uploadLoc + "video/3D_Showoff.mp4");
			//});
			
			
			//for (let i=0; i<$(".headerLinks, .headerLinkselected").length; i++) {
			//	$(".headerLinks, .headerLinkselected")[i].addEventListener('click', function() { headerLink_Click(this);} );
			//}
			//for (let i=0; i<$(".headerLinks, .headerLinkselected").length; i++) {
			//	$(".aboutTab, .aboutTab_Selected")[i].addEventListener('click', function() { headerLink_Click(this);} );
			//}
			
			//$("#BG:hidden").fadeIn(200, function() {
				$("#Header:hidden").fadeIn(400, function() {
					$("#PROJECTS:hidden").fadeIn( 600, function() {
						ResizeProjectList();
						//LoadAssocPics();
						LoadImageBar();
					});
				});
			//});
			
			$(window).resize(function() {
				ResizeProjectList();
			});
			
			console.log("COMPLETE");
		};



		

	}
}
	
export { indexScript };