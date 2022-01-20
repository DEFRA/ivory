'use strict'

import { Paths } from '../../../utils/constants.js';
import { get, post } from '../../common/address-find.route.js';

export default [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_FIND}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_FIND}`,
    handler: post
  }
];
