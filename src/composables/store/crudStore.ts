import { Ref } from 'vue';

function useCrudStore<T>(entries: Ref<T[]>) {
  function find(id: string | number) {
    const entry = entries.value.find((entry) => entry.uid === id);
    if (!entry) {
      return Promise.reject(new Error('Entry not found.'));
    }

    return Promise.resolve(entry);
  }

  function create(data: T) {
    entries.value.push(data);

    return Promise.resolve(data);
  }
  async function update(id: string | number, data: Partial<T>) {
    const entry = await find(id);

    Object.assign(entry, data);

    return entry;
  }
  function remove(id: string | number) {
    entries.value.splice(entries.value.findIndex((entry) => entry.uid === id), 1);

    return Promise.resolve();
  }

  return {
    find,
    create,
    update,
    remove,
  };
}

export {
  useCrudStore,
};
