/*
https://devstreaming-cdn.apple.com/videos/wwdc/2014/513xxhfudagscto/513/ipad_c.m3u8?24113
https://devstreaming-cdn.apple.com/videos/wwdc/2015/5048tyhotl6/504/hls_vod_mvp.m3u8?40605
https://devstreaming-cdn.apple.com/videos/wwdc/2016/511nqyciexman7sf932/511/hls_vod_mvp.m3u8?28185
https://devstreaming-cdn.apple.com/videos/wwdc/2017/811evqx1dsujdj5222/811/hls_vod_mvp.m3u8?28706
https://devstreaming-cdn.apple.com/videos/wwdc/2018/230bqynnqagiq4p8/230/hls_vod_mvp.m3u8?8396
https://devstreaming-cdn.apple.com/videos/wwdc/2019/403n9n5z0vd71jw4q2/403/hls_vod_mvp.m3u8?41511
https://devstreaming-cdn.apple.com/videos/wwdc/2020/10970/2/E58549F7-1B89-47E6-B569-083F8033815E/master.m3u8?72389
https://devstreaming-cdn.apple.com/videos/wwdc/2021/10308/18/BA664ADF-042F-4084-8565-61FC83578C92/cmaf.m3u8?8050
https://devstreaming-cdn.apple.com/videos/wwdc/2022/10110/3/9DDED4EB-547B-46DD-AEE5-9D3F2C60CFF8/cmaf.m3u8?55450
https://devstreaming-cdn.apple.com/videos/wwdc/2023/10036/4/BB960BFD-F982-4800-8060-5674B049AC5A/cmaf.m3u8?33690
https://devstreaming-cdn.apple.com/videos/tech-talks/111378/1/9C6D10DC-D9D4-43E8-BF45-A2DCB3A9CD0E/cmaf.m3u8

surge script
pattern=devstreaming-cdn\.apple\.com\/videos\/(wwdc|tech-talks)\/.*\/(ipad_c|cmaf|hls_vod_mvp|master)\.m3u8
*/

function resolveRemoveResolutions(source) {
  let resolutions = source
    .match(/RESOLUTION=(\d+x\d+)/g)
    .map((a) => a.replace("RESOLUTION=", ""));

  resolutions = [...new Set(resolutions)];

  if (resolutions.length == 0) {
    return [];
  }

  /*
   * 低端设备上通过 Developer app 无法播放音频
   */
  if (resolutions.filter((a) => a.endsWith("1440")).length > 0) {
    let removeed = resolutions.filter((a) => {
      const height = a.split("x")[1];
      if (Number(height) < 1440) {
        return true;
      }
      return false;
    });
    return removeed;
  }

  if (resolutions.filter((a) => a.endsWith("1080")).length > 0) {
    let removeed = resolutions.filter((a) => {
      const height = a.split("x")[1];
      if (Number(height) < 1080) {
        return true;
      }
      return false;
    });
    return removeed;
  }

  if (resolutions.filter((a) => a.endsWith("720")).length > 0) {
    let removeed = resolutions.filter((a) => {
      const height = a.split("x")[1];
      if (Number(height) < 720) {
        return true;
      }
      return false;
    });
    return removeed;
  }

  return [];
}

function modify(source, removeResolutions) {
  const resolutionPattern = /RESOLUTION=(\d+x\d+)/;
  const lines = source.split("\n");
  let modifyBody = "";
  let len = lines.length;
  let index = 0;
  while (len > 0 && index < len) {
    const line = lines[index];
    const match = line.match(resolutionPattern);
    if (match) {
      const resolution = match[1];
      if (removeResolutions.includes(resolution)) {
        if (index + 1 < len && !lines[index + 1].startsWith("#")) {
          index += 2;
        } else {
          index++;
        }
        continue;
      } else {
        modifyBody += line + "\n";
      }
    } else {
      modifyBody += line + "\n";
    }

    index++;
  }
  return modifyBody;
}

let headers = $response.headers;
let body = $response.body;
const removeResolutions = resolveRemoveResolutions(body);
if (removeResolutions.length == 0) {
  headers["x-modified-status"] = "0";
  $done({ headers: headers });
} else {
  const modifyBody = modify(body, removeResolutions);
  headers["x-modified-status"] = "1";
  $done({ body: modifyBody, headers: headers });
}
