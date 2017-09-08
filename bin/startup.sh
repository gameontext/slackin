#!/bin/bash

# Configure our link to etcd based on shared volume with secret
if [ ! -z "$ETCD_SECRET" ]; then
  . /data/primordial/setup.etcd.sh /data/primordial $ETCD_SECRET
fi

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

  if [ -z "$SLACK_API_TOKEN" ]; then
    export SLACK_API_TOKEN=$(etcdctl get /slackin/token)
    export SLACK_COC=$(etcdctl get /slackin/coc)
    export SLACK_CHANNELS=$(etcdctl get /slackin/channels)
    export SLACK_SUBDOMAIN=$(etcdctl get /slackin/team)
  fi 
  
fi

exec ./bin/slackin --coc "$SLACK_COC" --channels "$SLACK_CHANNELS" --port 3000 --interval 60000 "$SLACK_SUBDOMAIN" "$SLACK_API_TOKEN"

