'use strict'

import { Paths } from '../../../utils/constants.js';
import { get, post } from '../../common/address-international.route.js';

export default [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_INTERNATIONAL}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_INTERNATIONAL}`,
    handler: post
  }
];
