'use strict'

import { Paths } from '../../../utils/constants.js';
import { get, post } from '../../common/address-confirm.route.js';

export default [
  {
    method: 'GET',
    path: `${Paths.APPLICANT_ADDRESS_CONFIRM}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_ADDRESS_CONFIRM}`,
    handler: post
  }
];
