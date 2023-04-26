import * as entity from './entity/index.js'
import SubscriptionService from './subscription-service.js'

const service = {
  subscriptionService: new SubscriptionService(),
}

export { service, entity }
