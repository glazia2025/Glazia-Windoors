const query = `
[out:json][timeout:25];
(
  node["tourism"="hotel"](28.4,77.0,28.8,77.5);
  way["tourism"="hotel"](28.4,77.0,28.8,77.5);
  relation["tourism"="hotel"](28.4,77.0,28.8,77.5);
);
out center;
`;

async function fetchHotels() {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
    });

    const text = await response.text();

    console.log(text); // debug first 200 chars
}

fetchHotels();