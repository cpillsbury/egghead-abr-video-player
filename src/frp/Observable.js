'use strict';

// TODO: The purpose of this is to abstract the Rx lib dependency. Still remove import? (CJP)
import { Observable } from 'rxjs';

const { combineLatest, ajax } = Observable;

export { combineLatest, ajax };