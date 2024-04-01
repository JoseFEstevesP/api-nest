export const validation = ({ resValidation, msg, name, errors }) => {
  if (resValidation) {
    if (!resValidation?.status) {
      errors.push({ [name]: msg.validation.disability });
    } else if (!resValidation?.activatedAccount) {
      errors.push({ [name]: msg.validation.activatedAccount });
    } else {
      errors.push({ [name]: msg.validation.default });
    }
  }
};
