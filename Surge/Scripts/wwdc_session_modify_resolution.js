const keepResolutions = ["1920x1080", "2560x1440", "3840x2160"];

const resolutionPattern = /RESOLUTION=(\d+x\d+)/;

let body = $response.body;
const lines = body.split("\n");
let modifyBody = "";
for (const line of lines) {
  const match = line.match(resolutionPattern);
  if (match) {
    const resolution = match[1];
    if (keepResolutions.includes(resolution)) {
      modifyBody += line + "\n";
    }
  } else {
    modifyBody += line + "\n";
  }
}

let headers = $response.headers;
headers["X-Modified-By"] = "Surge";

$done({ body: modifyBody, headers: headers });
