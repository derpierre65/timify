
export default class AbstractApiInterface<T, TConfig = object> {
  show(id: string | number, config: TConfig): Promise<T> {
    return Promise.reject('show is not implemented');
  }

  store(data: Partial<T>, config?: TConfig): Promise<T> {
    return Promise.reject('store is not implemented');
  }

  update(id: string | number, data: Partial<T>, config?: TConfig): Promise<T> {
    return Promise.reject('update is not implemented');
  }

  destroy(id: string | number, config?: TConfig): Promise<void> {
    return Promise.reject('destroy is not implemented');
  }
}
