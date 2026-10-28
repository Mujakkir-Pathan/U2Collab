{{/*
Chart name (respects nameOverride).
*/}}
{{- define "u2collab.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Fully qualified app name, e.g. "myrelease-u2collab" (respects fullnameOverride).
Used to name Deployments so multiple releases don't collide.
*/}}
{{- define "u2collab.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "u2collab.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Common labels stamped on every resource.
*/}}
{{- define "u2collab.labels" -}}
app.kubernetes.io/name: {{ include "u2collab.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end -}}
