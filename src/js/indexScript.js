// Importing project data from DomeProjectsDataList.js
import { DomeProjectData } from '../../uploads/360Projects/DomeProjectsDataList.js';

// Importing image bar data from imageBarList.js
import { imageBarList } from './imageBarList.js';

// This script is responsible for managing the main functionalities of the webpage, 
// including handling image bars, project selection, and navigation.

export class IndexScript {
    constructor() {
        // Constants and variables used in the script
        const uploadLoc = "../../uploads";  // Location of uploaded files (not currently used)
        let selectedGroup;                  // Stores the currently selected group
        let groups = [];                    // Array to store project groups

        // Function to extract the base name from a file path
        function baseName(str) {
            let base = new String(str).substring(str.lastIndexOf('/') + 1); 
            if (base.lastIndexOf(".") != -1)       
                base = base.substring(0, base.lastIndexOf("."));
            return base;
        }

        // Function to handle click events for selecting project groups
        function GroupSelection_Click(link) {
            $("#Choose").hide(); // Hide the "Choose" element when a group is selected
            if ($(link)[0].className == "groupLinkselected") return; // Return if the group is already selected
            
            // Deselect any previously selected group
            $(".groupLinkselected").each(function() {
                this.className = "groupLinks";
            });

            $(link)[0].className = "groupLinkselected"; // Mark the clicked group as selected

            let tmp = [...DomeProjectData]; // Create a temporary array of projects

            // Loop through all projects and show/hide based on the selected group
            tmp.forEach(project => {
                let group = project.group;
                let projectName = project.project;
                let projectLink = document.getElementById(`projectLink_${group}_${projectName}`);
                let projectImageLink = document.getElementById(`projectImageLink_${group}_${projectName}`);
                
                if (group == link.id) {
                    $(projectLink).show();
                    $(projectImageLink).show();
                } else {
                    $(projectLink).hide();
                    $(projectImageLink).hide();
                }
            });
        }

        // Function to add a project group to the group list
        function AddProjectGroup(group) {
            // Check if the group is already in the list
            if (!groups.includes(group)) {
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.href = "#";
                a.innerText = group;
                a.className = "groupLinks";
                li.appendChild(a);
                a.id = group;
                document.getElementById("ProjectGroupList").appendChild(li);
                a.addEventListener('click', () => GroupSelection_Click(a)); // Add click event listener
                groups.push(group);
            }
        }

        // Function to handle click events for header links (e.g., "Services", "Projects", etc.)
        function headerLink_Click(link) {
            if ($(link)[0].className == "headerLinkselected") return; // Return if the link is already selected
            
            // Deselect any previously selected header link
            $(".headerLinkselected").each(function() {
                this.className = "headerLinks";
            });

            $(link)[0].className = "headerLinkselected"; // Mark the clicked header link as selected

            // Hide all visible sections and fade in the selected section
            $("#SERVICES:visible, #PROJECTS:visible, #ABOUT:visible, #CONTACT:visible, #TECHNOLOGY:visible").fadeOut(200, function() {
                switch ($(link)[0].innerText) {
                    case "Services":
                        $("#SERVICES:hidden").fadeIn(500, () => console.log("Services"));
                        break;
                    case "Projects":
                        $("#PROJECTS:hidden").fadeIn(500, () => console.log("Projects"));
                        break;
                    case "Technology":
                        $("#TECHNOLOGY:hidden").fadeIn(500, () => console.log("Technology"));
                        break;
                    case "About the Team":
                        $("#ABOUT:hidden").fadeIn(500, () => console.log("About"));
                        break;
                    case "Contact":
                        $("#CONTACT:hidden").fadeIn(500, () => console.log("Contact"));
                        break;
                }
            });
        }

        // Image Bar functionality
        let imgbar_imgtoload = []; // Array to store image paths to load in the image bar

        // Recursive function to load images in the image bar
        function LoadimgBarLoop() {
            if (imgbar_imgtoload.length === 0) return; // Exit if no images are left to load

            let image = new Image();
            image.src = imgbar_imgtoload[0];
            image.onload = function() {
                let img = document.createElement("img");
                img.src = image.src;
                img.addEventListener('click', function() { FullScreenImage_Open(this); });
                document.getElementById("ImageBarDiv").appendChild(img);
                $(img).show();

                imgbar_imgtoload.splice(0, 1); // Remove the loaded image from the array
                LoadimgBarLoop(); // Recursively load the next image
            };
        }

        // Function to display a full-screen image when clicked
        function FullScreenImage_Open(img) {
            // Code to open full-screen image view (not implemented in this snippet)
        }

        // Function to initialize the project groups and links
        function Initialize() {
            DomeProjectData.forEach(project => {
                let group = project.group;
                let projectName = project.project;
                let projectLink = document.getElementById(`projectLink_${group}_${projectName}`);
                let projectImageLink = document.getElementById(`projectImageLink_${group}_${projectName}`);
                
                if (projectLink) {
                    $(projectLink).click(() => { 
                        // Code to handle project link click (not implemented in this snippet)
                    });
                }

                if (projectImageLink) {
                    $(projectImageLink).click(() => { 
                        // Code to handle project image link click (not implemented in this snippet)
                    });
                }

                AddProjectGroup(group); // Add the project group to the list
            });

            // Initialize the image bar
            imageBarList.forEach(img => imgbar_imgtoload.push(img));
            LoadimgBarLoop();
        }

        // Public method to start the script
        this.START = function() {
            Initialize();
        };
    }
}
