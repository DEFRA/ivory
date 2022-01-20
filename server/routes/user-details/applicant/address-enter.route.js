'use strict'

import { Paths } from '../../../utils/constants.js';
import { get, post } from '../../common/address-enter.route.js';

export default [
  {
    method: 'GET',
    path: `${Paths.APPLICANT_ADDRESS_ENTER}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_ADDRESS_ENTER}`,
    handler: post
  }
];
