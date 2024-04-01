export const validationLogin = ({ resValidation, msg, name, errors }) => {
  if (!resValidation) {
    errors.push({ [name]: msg.login.error });
  }

  if (resValidation) {
    if (!resValidation?.status) {
      errors.push({ [name]: msg.login.status });
    }
    if (!resValidation?.activatedAccount) {
      errors.push({ [name]: msg.login.activatedAccount });
    }
  }
};
