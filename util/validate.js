/**
 * Validates required keys in an object.
 * @param {string[]} arrKeyReq - List of required keys.
 * @param {Object} arrkeyInput - Object containing input data.
 * @returns {string[]} - An array of missing field names.
 */

exports.validateKeyInput = (arrKeyReq, arrkeyInput) => {
  return arrKeyReq
    .filter((field) => !arrkeyInput[field])
    .map((field) => `${field}`);
};
/**
 * Extracts all required field names from a Mongoose schema.
 *
 * @param {Object} model - The Mongoose schema object to extract required fields from.
 * @returns {string[]} - An array of field names that are marked as required in the schema.
 */
exports.getRequiredFields = (model) => {
  return Object.keys(model.schema.obj).filter(
    (field) => model.schema.obj[field].required
  );
};

/**
 *
 * @param {Object} schema - The Mongoose schema object extract field name form
 * @param {Object} reqBody -  The require  body containing input data
 * @returns {Object} - An object containing the values from req.body based on the field names in the schema.
 */

exports.extractDataBySchema = (model, data) => {
  if (!model || !model.schema || !model.schema.obj) {
    console.error("extractDataBySchema: Schema is undefined or invalid", model);
    return {}; // Return empty object to prevent errors
  }

  if (!data || typeof data !== "object") {
    console.error("extractDataBySchema: Request body is invalid", data);
    return {}; // Return empty object
  }

  return Object.keys(model.schema.obj).reduce((result, key) => {
    if (data.hasOwnProperty(key)) {
      result[key] = data[key];
    }
    return result;
  }, {});
};

/**
 *
 * @param {*} data
 * @returns  number
 */
exports.convertStringToNumber = (data) => {
  let result = data;
  if (typeof data !== "number") {
    result = parseInt(data);
  }
  return data;
};

/**
 * Generates a random string of the specified length and appends the current time.
 *
 * @param {number} length - The length of the random string.
 * @returns {string} - A random string of the specified length with the current time.
 */
exports.generateRandomStringWithTime = (length = 6) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  // Generate the random string
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  // Append current timestamp (milliseconds since epoch)
  const timestamp = new Date().getTime();

  // Combine random string and timestamp
  return `${result}-${timestamp}`;
};

exports.isValidEnumData = (enumObj, data) => {
  return Object.values(enumObj).includes(data);
};

/**
 *
 * @param {*} data
 * @returns Array uniqueData
 */
exports.getUniqueDataRolePermissionDetails = (data) => {
  const uniqueData = [];
  const seen = new Set();
  data.forEach((item) => {
    const identifier = `${item.role_id}-${item.permission_id}`;
    if (!seen.has(identifier)) {
      uniqueData.push(item);
      seen.add(identifier);
    }
  });

  return uniqueData;
};
