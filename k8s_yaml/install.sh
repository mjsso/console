#!/bin/bash

NAME_HC4="hypercloud4-operator-service"
NAME_PROM="prometheus-k8s"
file_initialzation="./1.initialization.yaml"
file_svc_np="./2.svc-np.yaml"
file_svc_lb="./2.svc-lb.yaml"
file_deployment_pod="./3.deployment-pod.yaml"
file_deployment_pod_temp="./3.deployment-pod-temp.yaml"

echo "==============================================================="
echo "STEP 1. ENV Setting"
echo "==============================================================="
# Enter docker tag (console version) 
echo -e "Enter the console version (default latest):"
read version
CONSOLE_VERSION=$version
if [ ${CONSOLE_VERSION}=="" ]; then 
    echo "CONSOLE_VERSION=latest"
else
    echo "CONSOLE_VERSION=${CONSOLE_VERSION} " 
fi 
# hypercloud ip addr 
HC4_IP=$(kubectl get svc -A | grep ${NAME_HC4} | awk '{print $5}')
HC4_PORT=$(kubectl get svc -A | grep ${NAME_HC4} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')

if [ -z $HC4_IP ]; then 
    echo "Cannot find HC4_IP in ${NAME_HC4}. Is hypercloud4-system installed?"
    exit 1 
fi 
# prometheus ip addr 
PROM_IP=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $5}')
PROM_PORT=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')
if [ -z $PROM_IP ]; then 
    echo "Cannot find PROMETHEUS_IP in ${NAME_PROM}. Is prometheus installed?"
    exit 1 
fi 
# put HC4, PROM, TAG into 3.deployment-pod-temp.yaml
cp $file_deployment_pod $file_deployment_pod_temp
HC4=$HC4_IP":"$HC4_PORT
PROM=$PROM_IP":"$PROM_PORT
echo "Hypercloud Addr = ${HC4}"
echo "Prometheus Addr = ${PROM}"
echo "" 
sed -i "s/@@HC4@@/${HC4}/g" ${file_deployment_pod_temp}
sed -i "s/@@PROM@@/${PROM}/g" ${file_deployment_pod_temp}
sed -i "s/@@TAG@@/${CONSOLE_VERSION}/g" ${file_deployment_pod_temp}


echo "==============================================================="
echo "STEP 2. Install console"
echo "==============================================================="
# Create Namespace
if [ -z $(kubectl get ns | grep console-system | awk '{print $1}') ]; then 
    kubectl create -f ${file_initialzation}
else
    echo "namespace exist"
    kubectl get ns 
fi 
echo ""
# Create Secret to enable https between browser and console-server
if [ -z $(kubectl get secret -n console-system | grep console-https-secret | awk '{print $1}') ]; then 
    kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n console-system
else
    echo "secret exists" 
    kubectl get secret console-https-secret -n console-system
fi 
echo ""
# Create Service 
if [ -z $(kubectl get svc -n console-system | grep console-np | awk '{print $1}') ]; then 
    kubectl create -f ${file_svc_np}
else
    echo "NodePort service exists" 
    kubectl get svc -n console-system 
fi
echo ""
if [ -z $(kubectl get svc -n console-system | grep console-lb | awk '{print $1}') ]; then 
    kubectl create -f ${file_svc_lb}
else
    echo "LoadBalancer service exists" 
    kubectl get svc -n console-system 
fi
echo ""
# Create Deployment
if [ -z $(kubectl get deployment -n console-system | grep console | awk '{print $1}') ]; then
    kubectl create -f ${file_deployment_pod_temp}
else
    echo "deployment exists" 
    kubectl get deployment -n console-system
fi 
echo ""

echo "==============================================================="
echo "STEP 3. Is Console-pod Running??"
echo "==============================================================="
count=0
stop=60 
while :
do 
    count=$(($count+1))
    echo "Waiting for $count seconds..."
    RUNNING_FLAG=$(kubectl get po -n console-system | grep console | awk '{print $3}')
    if [ ${RUNNING_FLAG} == "Running" ]; then
        echo "Console has been successfully deployed to console-system."
        # rm -rf ${file_deployment_pod_temp}
        break 
    fi
    if [ $count -eq $stop ]; then 
        echo "Pod has a problem"
        echo "Please check the logs" 
        kubectl logs -n console-system $(kubectl get po -n console-system | grep console | awk '{print $1}') 
        break  
    fi
    kubectl get po -n console-system 
    sleep 1
done 
echo "Console installation completed."