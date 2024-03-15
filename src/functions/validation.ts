export const validation = ({ resValidation, msg, name, errors }) => {
  if (resValidation) {
    if (resValidation?.status) {
      errors.push({ [name]: msg.validation.default });
    } else {
      errors.push({ [name]: msg.validation.disability });
    }
  }
};
