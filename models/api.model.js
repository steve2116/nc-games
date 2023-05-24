const methodWL = require("../Queries/api/methodWL.js");
const endpoints = require("../endpoints.js");

exports.queryEndpoints = ({
    method,
    status,
    hasKeys,
    hasQueries,
    req_body,
    res_body,
    limit,
    p,
}) => {
    return new Promise((resolve, reject) => {
        if (isNaN(limit) || limit < 1 || limit % 1 !== 0) limit = 10;
        if (isNaN(p) || p < 1 || p % 1 !== 0) p = 1;
        let ePs = { ...endpoints.endpoints };
        if (method && methodWL.includes(method)) {
            ePs = Object.entries(ePs).reduce(
                (newEndpoints, [endpoint, epObject]) => {
                    for (let key in epObject) {
                        if (key === method) {
                            newEndpoints = {
                                ...newEndpoints,
                                [endpoint]: {
                                    [key]: epObject[key],
                                },
                            };
                        }
                    }
                    return newEndpoints;
                },
                {}
            );
        }
        if (status && typeof status === "string") {
            ePs = Object.entries(ePs).reduce(
                (newEndpoints, [endpoint, epObject]) => {
                    let newMeths = {};
                    for (let [key, method] of Object.entries(epObject)) {
                        if (method.status === status) {
                            newMeths = { ...newMeths, [key]: method };
                        }
                    }
                    return Object.keys(newMeths).length > 0
                        ? { ...newEndpoints, [endpoint]: newMeths }
                        : newEndpoints;
                },
                {}
            );
        }
        if (hasKeys && ["true", "false"].includes(hasKeys)) {
            ePs = Object.entries(ePs).reduce(
                (newEndpoints, [endpoint, epObject]) => {
                    let newMeths = {};
                    for (let [key, method] of Object.entries(epObject)) {
                        if (
                            (hasKeys === "true" && method.keys.length !== 0) ||
                            (hasKeys === "false" && method.keys.length === 0)
                        ) {
                            newMeths = { ...newMeths, [key]: method };
                        }
                    }
                    return Object.keys(newMeths).length > 0
                        ? { ...newEndpoints, [endpoint]: newMeths }
                        : newEndpoints;
                },
                {}
            );
        }
        if (hasQueries && ["true", "false"].includes(hasQueries)) {
            ePs = Object.entries(ePs).reduce(
                (newEndpoints, [endpoint, epObject]) => {
                    let newMeths = {};
                    for (let [key, method] of Object.entries(epObject)) {
                        if (
                            (hasQueries === "true" &&
                                method.queries.length !== 0) ||
                            (hasQueries === "false" &&
                                method.queries.length === 0)
                        ) {
                            newMeths = { ...newMeths, [key]: method };
                        }
                    }
                    return Object.keys(newMeths).length > 0
                        ? { ...newEndpoints, [endpoint]: newMeths }
                        : newEndpoints;
                },
                {}
            );
        }
        if (req_body && typeof req_body === "string") {
            ePs = Object.entries(ePs).reduce(
                (newEndpoints, [endpoint, epObject]) => {
                    let newMeths = {};
                    for (let [key, method] of Object.entries(epObject)) {
                        if (method["req-body"] === req_body) {
                            newMeths = { ...newMeths, [key]: method };
                        }
                    }
                    return Object.keys(newMeths).length > 0
                        ? { ...newEndpoints, [endpoint]: newMeths }
                        : newEndpoints;
                },
                {}
            );
        }
        if (res_body && typeof res_body === "string") {
            ePs = Object.entries(ePs).reduce(
                (newEndpoints, [endpoint, epObject]) => {
                    let newMeths = {};
                    for (let [key, method] of Object.entries(epObject)) {
                        if (method["res-body"] === res_body) {
                            newMeths = { ...newMeths, [key]: method };
                        }
                    }
                    return Object.keys(newMeths).length > 0
                        ? { ...newEndpoints, [endpoint]: newMeths }
                        : newEndpoints;
                },
                {}
            );
        }
        if (limit) {
            const counter = [0, 0];
            ePs = endpoints.endpoints["/api"].get.keys.reduce(
                (newEndpoints, endpoint, index) => {
                    if (counter[1] < limit && Object.hasOwn(ePs, endpoint)) {
                        counter[0]++;
                        if (counter[0] > (p - 1) * limit) {
                            counter[1]++;
                            return {
                                ...newEndpoints,
                                [endpoint]: ePs[endpoint],
                            };
                        }
                    }
                    return newEndpoints;
                },
                {}
            );
        }
        resolve(ePs);
    });
};
