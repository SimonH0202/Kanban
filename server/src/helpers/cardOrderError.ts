export default class CardOrderError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
