export const validatePermission = ({
  permissions,
  permission,
}: {
  permissions: string;
  permission: string;
}) => {
  const validate = permissions
    .split(',')
    .some((item) => item === permission || item === 'SUPER');
  return validate;
};
