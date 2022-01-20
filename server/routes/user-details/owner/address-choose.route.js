'use strict'

import { Paths } from '../../../utils/constants.js';
import { get, post } from '../../common/address-choose.route.js';

export default [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: post
  }
];
