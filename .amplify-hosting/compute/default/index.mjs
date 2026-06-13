globalThis.__nitro_main__ = import.meta.url;
import { H as HTTPError, d as defineHandler, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { N as NodeResponse, t as toNodeHandler } from "./_libs/srvx.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Server } from "node:http";
import "./_libs/rou3.mjs";
import "node:stream";
import "node:stream/promises";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const assets = {
  "/logos/tablogo.png": {
    "type": "image/png",
    "etag": '"2081-IdGkhklrlVD/ako+IyjdDdH1sQs"',
    "mtime": "2026-06-13T21:09:20.148Z",
    "size": 8321,
    "path": "../../static/logos/tablogo.png"
  },
  "/logos/navlogo.png": {
    "type": "image/png",
    "etag": '"1940-ETVT3Z//CbUHGFX7DD1PbAbkB6E"',
    "mtime": "2026-06-13T21:09:20.148Z",
    "size": 6464,
    "path": "../../static/logos/navlogo.png"
  },
  "/assets/_authenticated-DJtF5LxA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d4-c2YFCiJi1AYNEvYqrW0JJBBFJBw"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 468,
    "path": "../../static/assets/_authenticated-DJtF5LxA.js"
  },
  "/assets/admin.bookings-_41_s-6Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a63-ZxVSW51QjNd0mRtshNSmuoOoO6c"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 10851,
    "path": "../../static/assets/admin.bookings-_41_s-6Z.js"
  },
  "/assets/admin.coupons-BOMa7IhT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2545-hSglKVL1ehHmxwlQox7q1TBLUhE"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 9541,
    "path": "../../static/assets/admin.coupons-BOMa7IhT.js"
  },
  "/assets/admin-BVDOw4uy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14b4b-lMeu88GXK1Xi3UHjnmJFbcO7bvE"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 84811,
    "path": "../../static/assets/admin-BVDOw4uy.js"
  },
  "/assets/admin.financials-BmDw_-I6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e4c-DPxpGNnf3ne7OGo785EXaGvL2W8"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 3660,
    "path": "../../static/assets/admin.financials-BmDw_-I6.js"
  },
  "/assets/admin.maintenance-C2K5dMqc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28d4-Sv7FpCAQBHmWf5MM2C045pvCzR4"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 10452,
    "path": "../../static/assets/admin.maintenance-C2K5dMqc.js"
  },
  "/assets/admin-page-skeletons-BOLhhWQA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1cc9-F32mIcYCqBNyEl8grnpOn/1zCZ0"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 7369,
    "path": "../../static/assets/admin-page-skeletons-BOLhhWQA.js"
  },
  "/assets/admin.monthly-rent-Cw82YCie.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6721-04vFAaniTwMiJ2c5ZMOrAXMCn6Y"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 26401,
    "path": "../../static/assets/admin.monthly-rent-Cw82YCie.js"
  },
  "/assets/admin.notifications-BzJ_1x37.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"db3-4he1Qy8QPYWAtapNH6vmZ3gj+gc"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 3507,
    "path": "../../static/assets/admin.notifications-BzJ_1x37.js"
  },
  "/assets/admin.profit-loss-B5Z2sCHI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4716-xf9kbNebkHEl0BOikdKI6cmTEB8"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 18198,
    "path": "../../static/assets/admin.profit-loss-B5Z2sCHI.js"
  },
  "/assets/BarChart-CJ-MvHHk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5dc7f-slG9fSSP7aLHXAlfNneNyg7Tcmk"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 384127,
    "path": "../../static/assets/BarChart-CJ-MvHHk.js"
  },
  "/assets/admin.reviews-CpUsv_5F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1640-cYz9MTsMpI66BsTUbz4465RnX9k"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 5696,
    "path": "../../static/assets/admin.reviews-CpUsv_5F.js"
  },
  "/assets/admin.rooms-BLHOz_rK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"291f-QKIT0CfMUA6bIoTznAEv0rtl3C8"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 10527,
    "path": "../../static/assets/admin.rooms-BLHOz_rK.js"
  },
  "/assets/admin.index-DF0ILTAc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e504-5/D5wzosTHezqpzOglxjXwnZcd0"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 58628,
    "path": "../../static/assets/admin.index-DF0ILTAc.js"
  },
  "/assets/admin.payments-CjW5dRSx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d88-WKJVLkRBuVOM6usgKfXKhYvXj2I"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 7560,
    "path": "../../static/assets/admin.payments-CjW5dRSx.js"
  },
  "/assets/admin.rooms._id-BISqYgZa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"58eb-WihNtNMrARwyAM+/Tq2BHmi0nWU"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 22763,
    "path": "../../static/assets/admin.rooms._id-BISqYgZa.js"
  },
  "/assets/admin.settings-afhMziZY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d6c-/EuCF58RbK6mEAaMiLE6vPE8OEw"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 19820,
    "path": "../../static/assets/admin.settings-afhMziZY.js"
  },
  "/assets/admin.staff-CyCkR082.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b06-q9W8PHt3jm45qZyRzKoTfO1PG7w"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 2822,
    "path": "../../static/assets/admin.staff-CyCkR082.js"
  },
  "/assets/admin.users-CKYb6caB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1aed-Yhm+B1A03ACkleHHqzJXinTWtmM"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 6893,
    "path": "../../static/assets/admin.users-CKYb6caB.js"
  },
  "/assets/admin.users._id-DFSFhGrH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b6b-NeFhjfGwCVQqSdZg1FQuqBRW4rc"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 2923,
    "path": "../../static/assets/admin.users._id-DFSFhGrH.js"
  },
  "/assets/alert-dialog-hEYXNd5H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14f3-wJWL9tQK0nog3Gov+DRgOpVcLi4"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 5363,
    "path": "../../static/assets/alert-dialog-hEYXNd5H.js"
  },
  "/assets/admin.bookings._id-BJzjO_Bl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"98b80-FP5q13K63J52mfyTWfFeB8FKVjM"',
    "mtime": "2026-06-13T21:09:18.913Z",
    "size": 625536,
    "path": "../../static/assets/admin.bookings._id-BJzjO_Bl.js"
  },
  "/assets/admin.facilities-aYDhUimE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"90249-txjpYLFM3XZPXv++DVbi6v1zLDA"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 590409,
    "path": "../../static/assets/admin.facilities-aYDhUimE.js"
  },
  "/assets/arrow-left-n_fkq_li.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-eXT0D13U7VpV1L1wjXcqFP1H7Pw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 177,
    "path": "../../static/assets/arrow-left-n_fkq_li.js"
  },
  "/assets/avatar-Bcz96tQE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e2e-L7MxQA7iLa/rM14Ou8CEPDW5QKM"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 3630,
    "path": "../../static/assets/avatar-Bcz96tQE.js"
  },
  "/assets/badge-DwYtR4R0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"313-X1ZaoP91+v+JqOzMwx6MVqu0e2g"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 787,
    "path": "../../static/assets/badge-DwYtR4R0.js"
  },
  "/assets/banknote-BxyKXt5L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fc-DRmMBkRvHWp6G9tvQSYxqNyUSTo"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 252,
    "path": "../../static/assets/banknote-BxyKXt5L.js"
  },
  "/assets/bed-double-DD_8_DIm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"135-fVwyl/hA/jvL1EbhA8LkVqNAZ88"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 309,
    "path": "../../static/assets/bed-double-DD_8_DIm.js"
  },
  "/assets/booking.keys-ssoGm4hy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115-0W1m0j6UrSlnSlxjlz6I6AgfFeI"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 277,
    "path": "../../static/assets/booking.keys-ssoGm4hy.js"
  },
  "/assets/button-DkIP9tWK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"529-dWQsCw5Qb2RdqBnzxWKwIZmKvOw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 1321,
    "path": "../../static/assets/button-DkIP9tWK.js"
  },
  "/assets/apiFetch-DMWm5ZV9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d7-QWI7vhHq90NF8Hz+BU0dAyZgHkw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 471,
    "path": "../../static/assets/apiFetch-DMWm5ZV9.js"
  },
  "/assets/calendar-check-Ds9-_8nF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13d-wRBZlA+Z2QEaal3dCE4C6maio1g"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 317,
    "path": "../../static/assets/calendar-check-Ds9-_8nF.js"
  },
  "/assets/booking-refund-dialog-C5-HJYwe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2ba4-Z69Fca0QYxG4+mU4oruddG8Liu0"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 11172,
    "path": "../../static/assets/booking-refund-dialog-C5-HJYwe.js"
  },
  "/assets/card-9mUt74Up.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3fa-UT6TRWkEArUbG2r6SX3siAQLZm4"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 1018,
    "path": "../../static/assets/card-9mUt74Up.js"
  },
  "/assets/chevron-right-Bq3HIq2k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8e-YB0noG2vmJ2hs4Q6qaxT3K/P758"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 142,
    "path": "../../static/assets/chevron-right-Bq3HIq2k.js"
  },
  "/assets/circle-C_pRuZTp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"89-Kzyht9YApiaPmwthB++F5sJrnHM"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 137,
    "path": "../../static/assets/circle-C_pRuZTp.js"
  },
  "/assets/clock-Cwt54aZb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-g3Qdhx5hSRI5C+NYlyvX2Gf2uow"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 176,
    "path": "../../static/assets/clock-Cwt54aZb.js"
  },
  "/assets/circle-check-C-8Cf1u4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b9-TTIXTXHua7yjxHxQGvboGWoq5zI"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 185,
    "path": "../../static/assets/circle-check-C-8Cf1u4.js"
  },
  "/assets/createLucideIcon-DGgp7a2M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4b9-FVxF6Faqz/DmgVppMs9Nkbtp3jc"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 1209,
    "path": "../../static/assets/createLucideIcon-DGgp7a2M.js"
  },
  "/assets/credit-card-ClZkEAlL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"db-5cQyPYFdKDmZxUrZNvynaVBhIVQ"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 219,
    "path": "../../static/assets/credit-card-ClZkEAlL.js"
  },
  "/assets/checkbox-CjHhaFfV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f8e-Wzna0wWjqEfDNQ0VcrBqmfvddY8"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 3982,
    "path": "../../static/assets/checkbox-CjHhaFfV.js"
  },
  "/assets/copy-BKdCdYaD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f3-rjndirlnj0KR8SJjHc+mkY+mOTs"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 243,
    "path": "../../static/assets/copy-BKdCdYaD.js"
  },
  "/assets/dashboard-DJXG_LKO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"143a-dRizasQuSH5wyd5F9IwCGbjwBkA"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 5178,
    "path": "../../static/assets/dashboard-DJXG_LKO.js"
  },
  "/assets/dialog-GEOTI3Lq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8a2-lAIQmumDvIMX2Xw+lGBeNfpUUsY"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 2210,
    "path": "../../static/assets/dialog-GEOTI3Lq.js"
  },
  "/assets/door-open-DHeZHY1t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"180-pGPXzKjV1ti3vKpJFsrA+L0ANWg"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 384,
    "path": "../../static/assets/door-open-DHeZHY1t.js"
  },
  "/assets/dropdown-menu-DSEPk-hH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5f96-XFF7l8JW7Os7x9KHvQBwNZ7eJsg"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 24470,
    "path": "../../static/assets/dropdown-menu-DSEPk-hH.js"
  },
  "/assets/eye-D5uPWtku.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-o8mblfS99f/MIVO1694AUoBpmQc"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 263,
    "path": "../../static/assets/eye-D5uPWtku.js"
  },
  "/assets/file-spreadsheet-CJVe3dNe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20a-mYQf7HYj9+W6QLDhNLGBmgM1TTU"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 522,
    "path": "../../static/assets/file-spreadsheet-CJVe3dNe.js"
  },
  "/assets/file-text-CxdefqHo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18d-bssi9SB6w1qm8qdU9N5UjB8jC90"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 397,
    "path": "../../static/assets/file-text-CxdefqHo.js"
  },
  "/assets/index-BQgpBDqk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e8-Wn2s7lA58GRu8N4ro636mSRVV2Q"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 232,
    "path": "../../static/assets/index-BQgpBDqk.js"
  },
  "/assets/index-BTh_uGza.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"852-fyUDBTRKOtvETURa1mgNPLCzBdw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 2130,
    "path": "../../static/assets/index-BTh_uGza.js"
  },
  "/assets/index-BXE3tcaA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"831-HmSxMsajN89lt4BDOcZMAEC/04A"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 2097,
    "path": "../../static/assets/index-BXE3tcaA.js"
  },
  "/assets/index-5wDirSu1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ba83-5fgeFdi68Z4dmy9Rb4gEZMTkpPA"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 47747,
    "path": "../../static/assets/index-5wDirSu1.js"
  },
  "/assets/index-C1LXer4U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10a0-NC4ZjMtukk50dHOLSXPEDWda9yw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 4256,
    "path": "../../static/assets/index-C1LXer4U.js"
  },
  "/assets/index-ChwL9qrv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19dd-u15b0Lgg76Tclhd27cqezWXgelk"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 6621,
    "path": "../../static/assets/index-ChwL9qrv.js"
  },
  "/assets/index-DDPo5WgK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29a-AmiTTsOwVoJy1/2XhR6WXiPzKBU"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 666,
    "path": "../../static/assets/index-DDPo5WgK.js"
  },
  "/assets/index-CobTJpls.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2bb-VB3Axpdvm5iMADqtjAGvZEeu5qk"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 699,
    "path": "../../static/assets/index-CobTJpls.js"
  },
  "/assets/index-DGWXFgNv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e01-OACnrzxbcs89rAlD0jVw1PGIyHE"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 3585,
    "path": "../../static/assets/index-DGWXFgNv.js"
  },
  "/assets/index-De07KaBE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"533-zVEjlMveaEPxbhuCbB4oLrLSH+Q"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 1331,
    "path": "../../static/assets/index-De07KaBE.js"
  },
  "/assets/index-DXSNhY51.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ac-s+9TQrgnXLQAsw9CpHeMhqRGcGs"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 172,
    "path": "../../static/assets/index-DXSNhY51.js"
  },
  "/assets/index-DkfxPAQF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6c-CLkw5URQc2lHSfeJ6j6xScEoSKo"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 108,
    "path": "../../static/assets/index-DkfxPAQF.js"
  },
  "/assets/index.es-5yaZnPkm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2725a-kpRmXOE+5NCo24+CiOQe8n7EyMc"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 160346,
    "path": "../../static/assets/index.es-5yaZnPkm.js"
  },
  "/assets/index-XexxUx_G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b52-oat0HdBi0KB5JxSInld79Qf3mFw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 2898,
    "path": "../../static/assets/index-XexxUx_G.js"
  },
  "/assets/index-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 41,
    "path": "../../static/assets/index-DtqBFgK5.js"
  },
  "/assets/input-B8JgrWF-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24e-3yL/y8mWakF1jXANR10xRyU2jCk"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 590,
    "path": "../../static/assets/input-B8JgrWF-.js"
  },
  "/assets/label-5Hu1Ec3J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3d5-6w2/aOyJBt53rToRxKX51EVHj3g"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 981,
    "path": "../../static/assets/label-5Hu1Ec3J.js"
  },
  "/assets/layout-dashboard-DAEmzfo_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16b-rLv063VQBZ204Hpx3Ph3fbpye+g"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 363,
    "path": "../../static/assets/layout-dashboard-DAEmzfo_.js"
  },
  "/assets/list-Dl4J3CBo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"264-w8aJx24xKa6HOrxYOdGyz5hwouY"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 612,
    "path": "../../static/assets/list-Dl4J3CBo.js"
  },
  "/assets/loader-circle-CN6A7sG8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"97-Xxr7cfby2MNdhbrKaxX/FXNaWa8"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 151,
    "path": "../../static/assets/loader-circle-CN6A7sG8.js"
  },
  "/assets/lock-BYYqOo4y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"258-a/Do3NcFiazOQP7qnG6F/G7sTMk"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 600,
    "path": "../../static/assets/lock-BYYqOo4y.js"
  },
  "/assets/index-CPXmrTnD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6efda-xqqUhRDRvVs3t3IP2/XqvE9fd0w"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 454618,
    "path": "../../static/assets/index-CPXmrTnD.js"
  },
  "/assets/login-DgR35-Ma.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91e7-VMtRJN6NNXnlQoSkkLrCp5PQgDI"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 37351,
    "path": "../../static/assets/login-DgR35-Ma.js"
  },
  "/assets/log-out-DbeYb0ZY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2-NQKgQ8BFSkU+8hV+faaEET0aztQ"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 242,
    "path": "../../static/assets/log-out-DbeYb0ZY.js"
  },
  "/assets/map-pin-BpDotBzu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1db-TIRgIdteRT7x74ttlHBy7NV1Hcs"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 475,
    "path": "../../static/assets/map-pin-BpDotBzu.js"
  },
  "/assets/payments-BMPrM6Zj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3a9-F1+/xJl0S1kaZ61ooQ0zGmqCHLQ"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 937,
    "path": "../../static/assets/payments-BMPrM6Zj.js"
  },
  "/assets/phone-DhAMNlQM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"389-3J+9Fb7l03ncNOe04slUWmqjQNY"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 905,
    "path": "../../static/assets/phone-DhAMNlQM.js"
  },
  "/assets/message-square-siGEskZH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e7-bPPSwVzPF2QCsGwPtXYFihE05wY"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 487,
    "path": "../../static/assets/message-square-siGEskZH.js"
  },
  "/assets/plus-BY4YbpIq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a5-5ElTE685iIBOfR0ejPxdRyG+JsQ"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 165,
    "path": "../../static/assets/plus-BY4YbpIq.js"
  },
  "/assets/mock-store-suzN4PP-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1127-bw5b4SFByNbyILhZ3u70jtBtEpk"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 4391,
    "path": "../../static/assets/mock-store-suzN4PP-.js"
  },
  "/assets/pencil-CzJyjXjH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"120-wG+NUW4PrFkEB0oocm2qTEmiACo"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 288,
    "path": "../../static/assets/pencil-CzJyjXjH.js"
  },
  "/assets/resident.keys-b_6fpAli.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fa-eQwUjmJx0odVpvxdajr0Q9zBp54"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 250,
    "path": "../../static/assets/resident.keys-b_6fpAli.js"
  },
  "/assets/purify.es-BZstNxVn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6352-VViAr0WtTAbTTV3B3gZT7oDg5zw"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 25426,
    "path": "../../static/assets/purify.es-BZstNxVn.js"
  },
  "/assets/room.keys-nwwz1hFB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9a-FaGv9PbJKLz8+rmWjuAm35i2y3c"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 154,
    "path": "../../static/assets/room.keys-nwwz1hFB.js"
  },
  "/assets/resident.types-BzVyyGE0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"146-+PFLa5IGauAvffm2kN92PzVJnB0"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 326,
    "path": "../../static/assets/resident.types-BzVyyGE0.js"
  },
  "/assets/room-form-dialog-4jsYKEIC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3baa-QFUWqc2XNKCneEkXOWHsCn7pa4A"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 15274,
    "path": "../../static/assets/room-form-dialog-4jsYKEIC.js"
  },
  "/assets/month-filter-select-DaXPSi4o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fdc-pprfVQoC7irLm9WaYA03SVsRzwA"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 4060,
    "path": "../../static/assets/month-filter-select-DaXPSi4o.js"
  },
  "/assets/search-CRUQL16x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b5-D16Uo7mwqOqcMwpzLfT/ykdi89c"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 181,
    "path": "../../static/assets/search-CRUQL16x.js"
  },
  "/assets/settings-DTMrrmsc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"476-v9CcjgjD1gFuV60KeyT0JP64EOw"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 1142,
    "path": "../../static/assets/settings-DTMrrmsc.js"
  },
  "/assets/select-BZpy9k4e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"585e-mSSFF3DeALLO2IMBJOfzoi17YcU"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 22622,
    "path": "../../static/assets/select-BZpy9k4e.js"
  },
  "/assets/mail-DVh4fGQC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e1-LJ8FQVMPd0NPAduOk9bYBgEtUYA"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 225,
    "path": "../../static/assets/mail-DVh4fGQC.js"
  },
  "/assets/share-2-CyTZeuHw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"566-CA2xAEZUhRUH+1n5S480LbVrWUc"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 1382,
    "path": "../../static/assets/share-2-CyTZeuHw.js"
  },
  "/assets/security-deposit-CItT3ktY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a7c-0uAM6h+nQp/rnROmrOtTy3u+sfI"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 2684,
    "path": "../../static/assets/security-deposit-CItT3ktY.js"
  },
  "/assets/shield-DeRF7FRM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"117-x0yDpWAvJfRfIM5dEXBK/ddSt40"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 279,
    "path": "../../static/assets/shield-DeRF7FRM.js"
  },
  "/assets/skeleton-DijJcHI4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2319-qbZzL8GZNIZU7viBDKbyDVBGbzA"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 8985,
    "path": "../../static/assets/skeleton-DijJcHI4.js"
  },
  "/assets/sparkles-CMCGEuP-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fa-38KRI5DOAnMRahljOe3/PvZNmmo"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 506,
    "path": "../../static/assets/sparkles-CMCGEuP-.js"
  },
  "/assets/star-DjXT5MAt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e4-3XITQEUPeRrcUbEsH8l5XmWXBKM"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 484,
    "path": "../../static/assets/star-DjXT5MAt.js"
  },
  "/assets/styles-DFCTf6nv.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"19c2d-zGnyu5YiliXtdyC+sqNNuWdq5C0"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 105517,
    "path": "../../static/assets/styles-DFCTf6nv.css"
  },
  "/assets/stat-card-BhdRWX-F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a9-I27n/5sZRW/kBTTqN24FvgTQWzw"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 1193,
    "path": "../../static/assets/stat-card-BhdRWX-F.js"
  },
  "/assets/table-Cs9Ua3m-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"63b-S1kx6svmXaymNUlx0DVaA77HJ34"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 1595,
    "path": "../../static/assets/table-Cs9Ua3m-.js"
  },
  "/assets/tabs-yXfF8Wpp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d11-tqEVxJdjhwYdG/rfEdRnI2C1dRc"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 3345,
    "path": "../../static/assets/tabs-yXfF8Wpp.js"
  },
  "/assets/switch-CjvQ1lsJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a38-HTEslJr9QQTc1PBsv2TNLaCopH0"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 2616,
    "path": "../../static/assets/switch-CjvQ1lsJ.js"
  },
  "/assets/ticket-percent-BkDuU9BP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"159-Ly6az2egHQ9QcHvhwd146kHmYIs"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 345,
    "path": "../../static/assets/ticket-percent-BkDuU9BP.js"
  },
  "/assets/textarea-B8An4Wyr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e8-Tz99a8xDh/aRxOTii/SqLSkXuVg"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 488,
    "path": "../../static/assets/textarea-B8An4Wyr.js"
  },
  "/assets/trash-2-DFtvfTGn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"154-FiyJV6ZuqYiYcq5FHjohSuw6k4w"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 340,
    "path": "../../static/assets/trash-2-DFtvfTGn.js"
  },
  "/assets/trending-up-D1rkLkB4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29d-NqBW9/gnpSEXQiQ/Ll2pHf2mQk4"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 669,
    "path": "../../static/assets/trending-up-D1rkLkB4.js"
  },
  "/assets/triangle-alert-DL7uNqQd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115-DrigXuSIBrdjIMPhZIzQfemWFm4"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 277,
    "path": "../../static/assets/triangle-alert-DL7uNqQd.js"
  },
  "/assets/useBookingOverviewStatsQuery-DDspxIei.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"33e-xj5XJ7ep/3+S4ekOz7twwmHXIlg"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 830,
    "path": "../../static/assets/useBookingOverviewStatsQuery-DDspxIei.js"
  },
  "/assets/useBookingsQuery-BIveTT5t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"34d-KAWR2V0v3BEw4cVYtYUVFXgpgAw"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 845,
    "path": "../../static/assets/useBookingsQuery-BIveTT5t.js"
  },
  "/assets/useMutation-C8aHFDmT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"89b-E/Cdzmy5T5Tdsj7CxclxKlBa5qk"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 2203,
    "path": "../../static/assets/useMutation-C8aHFDmT.js"
  },
  "/assets/useNotificationMutations-CkYqub4L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ff7-z540tya0WfFug66OQckEvQ+i884"',
    "mtime": "2026-06-13T21:09:18.909Z",
    "size": 16375,
    "path": "../../static/assets/useNotificationMutations-CkYqub4L.js"
  },
  "/assets/usePaymentsQuery-Bc489bmr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"351-y16owSXhIwv4I2/t30dPO6kOOyo"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 849,
    "path": "../../static/assets/usePaymentsQuery-Bc489bmr.js"
  },
  "/assets/usePropertySettingsQuery-B_fDFrfe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"343-rQzo7qtYe8tuRPcm/YEnXH7zC+s"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 835,
    "path": "../../static/assets/usePropertySettingsQuery-B_fDFrfe.js"
  },
  "/assets/trending-down-BdpHkz3k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a3-DeELOc6mzJ02gMUtn/xD1y2B6ls"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 1187,
    "path": "../../static/assets/trending-down-BdpHkz3k.js"
  },
  "/assets/useRoomsQuery-KNCBXIq8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"26c-3ef6sJ7IUIq5b0y7wwt+lgV/YLk"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 620,
    "path": "../../static/assets/useRoomsQuery-KNCBXIq8.js"
  },
  "/assets/useUpdateResidentMutation-6Cw4TUQU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"375-HzcUTe1b0DgKLsaz18lii9rDYEE"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 885,
    "path": "../../static/assets/useUpdateResidentMutation-6Cw4TUQU.js"
  },
  "/assets/user-plus-BDK0fAg4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"259-mmnDksZvua8lB8bW3Fx3efCKjcc"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 601,
    "path": "../../static/assets/user-plus-BDK0fAg4.js"
  },
  "/assets/user.keys-V4yIpg3n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c62-l4EjEJcCfHl1H977p7YYAP4xxRA"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 3170,
    "path": "../../static/assets/user.keys-V4yIpg3n.js"
  },
  "/assets/user-KnXDTGfc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cb-Ctw/Ate1Sh2BC9x6b+QiOb4jLtI"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 203,
    "path": "../../static/assets/user-KnXDTGfc.js"
  },
  "/assets/utils-DCADjnpI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6b9b-tSfrzcIHWeVNKawNWV0bEDmYWfc"',
    "mtime": "2026-06-13T21:09:18.912Z",
    "size": 27547,
    "path": "../../static/assets/utils-DCADjnpI.js"
  },
  "/assets/wallet-BCqJuLWB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12a-Oqx8raf9Gm7kpYDcbmtThjXdduQ"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 298,
    "path": "../../static/assets/wallet-BCqJuLWB.js"
  },
  "/assets/users-BN0BblXr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13e-iaprSr5UYfqFYRszXLI1tiOTdIw"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 318,
    "path": "../../static/assets/users-BN0BblXr.js"
  },
  "/assets/wrench-UBT4zcj7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"136-O7LREgVXtjuMjWHTNU1PT8OrsX0"',
    "mtime": "2026-06-13T21:09:18.910Z",
    "size": 310,
    "path": "../../static/assets/wrench-UBT4zcj7.js"
  },
  "/assets/x-B3yUoW-B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a6-8ZHsaq+LLS98h0BADmGziyEkY/c"',
    "mtime": "2026-06-13T21:09:18.911Z",
    "size": 166,
    "path": "../../static/assets/x-B3yUoW-B.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _PkzkpU = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_P0UAZN = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_P0UAZN };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_PkzkpU)
].filter(Boolean);
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      middleware.push(...h3App["~middleware"]);
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
const nitroApp = useNitroApp();
const server = new Server(toNodeHandler(nitroApp.fetch));
server.listen(3e3, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Listening on http://localhost:3000 (AWS Amplify Hosting)`);
  }
});
