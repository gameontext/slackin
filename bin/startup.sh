#!/bin/bash

# Configure our link to etcd based on shared volume with secret
if [ ! -z "$ETCD_SECRET" ]; then
  . /data/primordial/setup.etcd.sh /data/primordial $ETCD_SECRET
fi

# Configure amalgam8 for this container
export A8_SERVICE=slackin:v1
export A8_ENDPOINT_PORT=3000
export A8_ENDPOINT_TYPE=http

if [ "$ETCDCTL_ENDPOINT" != "" ]; then
  echo Setting up etcd...
  echo "** Testing etcd is accessible"
  etcdctl --debug ls
  RC=$?

  while [ $RC -ne 0 ]; do
      sleep 15

      # recheck condition
      echo "** Re-testing etcd connection"
      etcdctl --debug ls
      RC=$?
  done
  echo "etcdctl returned sucessfully, continuing"

  export A8_REGISTRY_URL=$(etcdctl get /amalgam8/registryUrl)
  export A8_CONTROLLER_URL=$(etcdctl get /amalgam8/controllerUrl)
  export A8_CONTROLLER_POLL=$(etcdctl get /amalgam8/controllerPoll)
  JWT=$(etcdctl get /amalgam8/jwt)
fi

if [ -z "$A8_REGISTRY_URL" ]; then
  #no a8, just run server.
  exec ./bin/slackin --coc "$SLACK_COC" --channels "$SLACK_CHANNELS" --port 3000 "SLACK_SUBDOMAIN" "$SLACK_API_TOKEN"
else
  #a8, configure security, and run via sidecar.
  if [ ! -z "$JWT" ]; then
    export A8_REGISTRY_TOKEN=$JWT
    export A8_CONTROLLER_TOKEN=$JWT
  fi

  exec a8sidecar --proxy --register ./bin/slackin --coc "$SLACK_COC" --channels "$SLACK_CHANNELS" --port 3000 "SLACK_SUBDOMAIN" "$SLACK_API_TOKEN"
fi
