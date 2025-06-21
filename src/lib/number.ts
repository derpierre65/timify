function rand(min: number, max: number) {
  min = Math.ceil(min);

  return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min;
}

export {
  rand,
};
