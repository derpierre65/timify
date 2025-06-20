import AbstractApiInterface from 'src/lib/resources/interfaces/AbstractApiInterface';
import { Store } from 'pinia';
import AbstractResource from 'src/lib/resources/AbstractResource';
import { uid } from 'quasar';
import type { ApiPaginationResponse } from 'src/types/api';

type StoreApiStoreFunctions<T> = {
  find: (id: string | number) => Promise<T>;
  create: (data: T) => Promise<T>;
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  remove: (id: string | number) => Promise<void>;
  index: (params: object, config?: object) => Promise<ApiPaginationResponse<T>>;
};

class PiniaStoreApiInterface<T> extends AbstractApiInterface<T, object> {
  constructor(private resource: AbstractResource<T>, private piniaStore: Store<string, StoreApiStoreFunctions<T>>) {
    super();
  }

  override index(params: object, config?: object) {
    return this.piniaStore.index(params, config);
  }

  override show(id: string | number, config?: object) {
    return this.piniaStore.find(id);
  }

  override store(data: Partial<T>, config?: object) {
    return this.piniaStore.create({
      ...this.resource.getDefaultValues(),
      ...data,
      uid: uid(),
    });
  }

  override update(id: string | number, data: Partial<T>, config?: object) {
    return this.piniaStore.update(id, data);
  }

  override destroy(id: string | number, config?: object) {
    return this.piniaStore.remove(id);
  }
}

export {
  PiniaStoreApiInterface as default,
  type StoreApiStoreFunctions,
};
