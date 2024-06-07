const keepResolutions = ["1920x1080", "2560x1440", "3840x2160"];

const resolutionPattern = /RESOLUTION=(\d+x\d+)/;

let body = $response.body;
const lines = body.split("\n");
let modifyBody = "";
let len = lines.length;
let index = 0;
while (len > 0 && index < len) {
  const line = lines[index];
  const match = line.match(resolutionPattern);
  if (match) {
    const resolution = match[1];
    if (keepResolutions.includes(resolution)) {
      modifyBody += line + "\n";
    } else {
      index += 2;
      continue;
    }
  } else {
    modifyBody += line + "\n";
  }

  index++;
}

let headers = $response.headers;
headers["X-Modified-By"] = "Surge";

$done({ body: modifyBody, headers: headers });
