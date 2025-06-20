import { useSettingsStore } from 'stores/settings';
import AbstractApiInterface from 'src/lib/resources/interfaces/AbstractApiInterface';
import StoreApiInterface, { type StoreApiStoreFunctions } from 'src/lib/resources/interfaces/PiniaStoreApiInterface';
import { Store } from 'pinia';

export default abstract class AbstractResource<T> {
    private interface: AbstractApiInterface<T> | null = null;

    private static _instance: unknown | null = null;

    constructor() {
      this.initializeInterface(useSettingsStore().storageType);
    }

    index(params: object, config?: object): Promise<T[]> {
      return this.interface!.index(params, config);
    }

    show(id: string | number, config?: object): Promise<T> {
      return this.interface!.show(id, config);
    }

    store(data: Partial<T>, config?: object): Promise<T> {
      return this.interface!.store(data, config);
    }

    update(id: string | number, data: Partial<T>, config?: object): Promise<T> {
      return this.interface!.update(id, data, config);
    }

    destroy(id: string | number, config?: object): Promise<void> {
      return this.interface!.destroy(id, config);
    }

    static get instance(): InstanceType<this> {
      if (!this._instance) {
        this._instance = new this();
      }

      return this._instance;
    }

    public getDefaultValues(): T {
      return {} as T;
    }

    private initializeInterface(storageType: string) {
      if (storageType === 'store') {
        this.interface = new StoreApiInterface<T>(this, this.piniaStore);
        return;
      }

      throw new Error(`Unknown storage type: ${storageType}. Available types: store, http,`);
    }

    get piniaStore(): Store<string, StoreApiStoreFunctions<T> & Record<string, unknown>> {
      return Promise.reject('store is not implemented');
    }

    get http() {
      return Promise.reject('http is not implemented');
    }
}
