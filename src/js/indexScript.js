import { DomeProjectData } from '../../uploads/360Projects/DomeProjectsDataList.js';
import { imageBarList } from './imageBarList.js';
			

class indexScript {
	constructor(object) {

		const uploadLoc = "../../uploads";
		let selectedGroup;
		
		let groups = [];

		

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
						$("#SERVICES:hidden").fadeIn(500, function() {
							console.log("Services");
						});
						break;
					case "Projects":
						$("#PROJECTS:hidden").fadeIn(500, function() {
							console.log("Projects");
						});
						break;
					case "Technology":
						$("#TECHNOLOGY:hidden").fadeIn(500, function() {
							console.log("Technology");
						});
						break;
					case "About the Team":
						$("#ABOUT:hidden").fadeIn(500, function() {
							console.log("About");
						});
						break;
					case "Contact":
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
			document.getElementById("ImageBar_RightButton").addEventListener('click', ImageBar_RightButton_Click);
			document.getElementById("ImageBar_LeftButton").addEventListener('click', ImageBar_LeftButton_Click);
				$("#Header:hidden").fadeIn(400, function() {
					$("#PROJECTS:hidden").fadeIn( 600, function() {
						ResizeProjectList();
						LoadImageBar();
					});
				});
			$(window).resize(function() {
				ResizeProjectList();
			});
			
			console.log("COMPLETE");
		};
	}
}
	
export {indexScript};