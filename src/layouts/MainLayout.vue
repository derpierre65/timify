<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer bordered>
      <q-list>
        Drawer
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="q-pa-sm tw:bg-neutral-700!" bordered>
      <div class="tw:container q-mx-auto flex">
        <div>
          This is an <a
            href="https://github.com/derpierre65/timify"
            class="tw:text-blue-400 tw:hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >Open Source</a> Project
        </div>
        <q-space />
        <div>
          <span>Proudly made by <a
            href="https://www.derpierre65.dev/"
            target="_blank"
            rel="noopener noreferrer"
            class="tw:text-blue-400 tw:hover:text-blue-300"
          >derpierre65</a> with </span>
          <q-icon name="fa fa-heart" color="red" />
          <span> in Ireland</span>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

