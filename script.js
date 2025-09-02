const p = document.getElementById("text");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let process;  //variable to track the type of data being fetched(ex.characters)
document.getElementById('button1').addEventListener('click', () => {
    process = 'Characters'; //set the process to 'Characters' when the button is clicked
});

//Event listener for the previous button. Get the URL for the previous page from the data-url attribute. If exists, fetch the details for the previous page.
prevButton.addEventListener("click", () => {
  const url = prevButton.getAttribute("data-url");
  if (url) fetchdetails(url,process);
});

//Event listener for the Next button. Get the URL for the previous page from the data-url attribute. If exists, fetch the details for the next page.
nextButton.addEventListener("click", () => {
  const url = nextButton.getAttribute("data-url");
  if (url) fetchdetails(url,process);
});

function showCharacters() {
  // Show previous and next buttons when Characters button is clicked
  prevButton.style.display = "inline-block";
  nextButton.style.display = "inline-block";
  fetchdetails("https://www.swapi.tech/api/people","Characters"); //Fetch data for characters
}

// procedure to fetch and display characters. In future,we can use this same procedure to fetch and display planets/vehicles by changing the process name
function fetchdetails(url, process) {
  p.innerHTML = "Loading...";  // show loading message while fetching data
  fetch(url)
    .then(response => response.json())
    .then(data => {
      p.innerHTML = ""; // Clear previous results

      // Loop over each item in results
      data.results.forEach(details => {
        const box = document.createElement("div"); 
        box.className = "detail-box";  

        // Display only name and clickable link
        box.innerHTML = `
          <h3>${details.name || details.title}</h3>
          <a href="#" class="detail-link" data-url="${details.url}">View Details</a>
        `;

        // Add click event to fetch details only when clicked
        box.querySelector(".detail-link").addEventListener("click", (e) => {
          e.preventDefault();
          box.innerHTML = "Loading details...";

          fetch(details.url)
            .then(res => res.json())
            .then(innerData => {
              const props = innerData.result.properties;

              if (process === "Characters") {
                box.innerHTML = `
                  <h3>${props.name}</h3>
                  <p><strong>Skin Color:</strong> ${props.skin_color}</p>
                  <p><strong>Eye Color:</strong> ${props.eye_color}</p>
                  <p><strong>Height:</strong> ${props.height} cm</p>
                  <p><strong>Mass:</strong> ${props.mass} kg</p>
                  <p><strong>Gender:</strong> ${props.gender}</p>
                  <p><strong>Birth Year:</strong> ${props.birth_year}</p>
                  <a href="#" class="back-link">Hide</a>
                `;

                // Back link to show only name/url again
                box.querySelector(".back-link").addEventListener("click", (e) => {
                  e.preventDefault();
                  box.innerHTML = `
                    <h3>${details.name || details.title}</h3>
                    <a href="#" class="detail-link" data-url="${details.url}">View Details</a>
                  `;
                  box.querySelector(".detail-link").addEventListener("click", (e) => {
                    e.preventDefault();
                    // re-trigger the detail fetch
                    fetch(details.url)
                      .then(res => res.json())
                      .then(innerData => {
                        const props = innerData.result.properties;
                        box.innerHTML = `
                          <h3>${props.name}</h3>
                          <p><strong>Skin Color:</strong> ${props.skin_color}</p>
                          <p><strong>Eye Color:</strong> ${props.eye_color}</p>
                          <p><strong>Height:</strong> ${props.height} cm</p>
                          <p><strong>Mass:</strong> ${props.mass} kg</p>
                          <p><strong>Gender:</strong> ${props.gender}</p>
                          <p><strong>Birth Year:</strong> ${props.birth_year}</p>
                          <a href="#" class="back-link">Hide</a>
                        `;
                      });
                  });
                });
              }
            });
        });

        p.appendChild(box);
      });

      // Update pagination button states and URLs
      prevButton.disabled = !data.previous;
      nextButton.disabled = !data.next;
      prevButton.setAttribute("data-url", data.previous);
      nextButton.setAttribute("data-url", data.next);
    })
    .catch(error => {
      p.textContent = 'Failed to load details';
      console.error(error);
    });
}

//Procedure to fetch and display Film data such as :Title,Producer,Director,Episode Id,Release Date,Starships and vehicles
function showFilms() {
  // hide previous and next button for films
  prevButton.style.display = "none";
  nextButton.style.display = "none";

  fetch('https://www.swapi.tech/api/films/')  // fetch film data from the API
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("List of Star Wars Films:");
      p.innerHTML = "";

      data.result.forEach(film => {
        // Create a container div for each film
        const filmDiv = document.createElement("div");
        filmDiv.className = "detail-box";

        // Add static film info
        filmDiv.innerHTML = `
          <strong>Title:</strong> ${film.properties.title}<br>
          <strong>Producer:</strong> ${film.properties.producer}<br>
          <strong>Director:</strong> ${film.properties.director}<br>
          <strong>Episode Id:</strong> ${film.properties.episode_id}<br>
          <strong>Release Date:</strong> ${film.properties.release_date}<br>
          <a href="#" class="starships-link">View Starships</a>
          <div class="starships-list"></div>
          <a href="#" class="vehicles-link">View Vehicles</a>
          <div class="vehicles-list"></div>
        `;

        p.appendChild(filmDiv);

        // Add click event for starships link
        const starshipLink = filmDiv.querySelector(".starships-link");
        const starshipList = filmDiv.querySelector(".starships-list");
        
        // Add click event for vehicles link
        const vehiclesLink = filmDiv.querySelector(".vehicles-link");
        const vehiclesList = filmDiv.querySelector(".vehicles-list");

        starshipLink.addEventListener("click", (e) => {
          e.preventDefault();

          if (starshipList.innerHTML !== "") {
            // Toggle back to collapsed state if already loaded
            starshipList.innerHTML = "";
            starshipLink.textContent = "View Starships";
            return;
          }

          starshipList.innerHTML = "Loading starships...";
          starshipLink.textContent = "Hide Starships";

          // Fetch starship names from url found in each film
          const starshipPromises = film.properties.starships.map(url =>
            fetch(url)
              .then(res => res.json())
              .then(data => data.result.properties.name)
              .catch(() => "Unknown")
          );

          Promise.all(starshipPromises).then(names => {
            if (names.length === 0) {
              starshipList.textContent = "None";
            } else {
              starshipList.innerHTML = names.map(name => `<p>${name}</p>`).join("");
            }
          });
        }); //end of starship logic
          //to display vehicles list
           vehiclesLink.addEventListener("click", (e) => {
           e.preventDefault();
      
          if (vehiclesList.innerHTML !== "") {
            // Toggle back to collapsed state if already loaded
             vehiclesList.innerHTML = "";
             vehiclesLink.textContent = "View Vehicles";
             return;
           }
         
          vehiclesList.innerHTML = "Loading vehicles...";
         vehiclesLink.textContent = "Hide vehicles";

          // Fetch vehicles names
          const vehiclesPromises = film.properties.vehicles.map(url =>
            fetch(url)
              .then(res => res.json())
              .then(data => data.result.properties.name)
              .catch(() => "Unknown")
          );

          Promise.all(vehiclesPromises).then(names => {
            if (names.length === 0) {
              vehiclesList.textContent = "None";
            } else {
              vehiclesList.innerHTML = names.map(name => `<p>${name}</p>`).join("");
            }
            
          });
          
        }); //end of vehicles logic
      });
    })
    .catch(error => {
      console.error('Error fetching films:', error);
    });
}
