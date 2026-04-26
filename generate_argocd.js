const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const argocdDir = path.join(rootDir, 'argocd');

function writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content.trim() + '\n');
}

const apps = [
    { name: 'common', helmPath: 'helm/common' },
    { name: 'api-gateway', helmPath: 'helm/services/api-gateway' },
    { name: 'auth-service', helmPath: 'helm/services/auth-service' },
    { name: 'user-service', helmPath: 'helm/services/user-service' },
    { name: 'appointment-service', helmPath: 'helm/services/appointment-service' },
    { name: 'notification-service', helmPath: 'helm/services/notification-service' },
    { name: 'frontend', helmPath: 'helm/services/frontend' }
];

const envs = [
    {
        name: 'dev',
        repo: 'https://github.com/HospitalManagementSystem-HMS/Hospital-Management.git',
        targetRevision: 'Dev',
        namespace: 'hms-dev'
    },
    {
        name: 'prod',
        repo: 'https://github.com/HospitalManagementSystem-HMS/Hospital-Management.git',
        targetRevision: 'master',
        namespace: 'hms-prod'
    }
];

envs.forEach(env => {
    apps.forEach(app => {
        const filePath = path.join(argocdDir, env.name, `${app.name}-${env.name}.yaml`);
        const content = `
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hms-${app.name}-${env.name}
  namespace: argocd
spec:
  project: default
  source:
    repoURL: ${env.repo}
    targetRevision: ${env.targetRevision}
    path: ${app.helmPath}
    helm:
      valueFiles:
        - values-${env.name}.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: ${env.namespace}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    
`;
        writeFile(filePath, content);
    });
});

console.log("ArgoCD manifests generated successfully.");
