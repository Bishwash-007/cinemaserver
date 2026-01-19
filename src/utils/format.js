export const formatValidation = errors => {
  if (!errors || !errors.issues) {
    return 'validation failed';
  }
  if (Array.isArray(errors.issues)) {
    return errors.issues.map(err => err.message).join(', ');
  }

  return JSON.stringify(errors);
};
