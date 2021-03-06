import * as React from 'react';
import { Link } from 'react-router-dom';
import * as classNames from 'classnames';
import * as _ from 'lodash-es';
import { K8sResourceKindReference, kindForReference } from '../../module/k8s';
import { withTranslation } from 'react-i18next';

export const Label: React.SFC<LabelProps> = ({ kind, name, value, expand }) => {
  const href = `/search?kind=${kind}&q=${value ? encodeURIComponent(`${name}=${value}`) : name}`;
  const klass = classNames('co-m-label', { 'co-m-label--expand': expand });

  return (
    <Link className={`co-text-${kindForReference(kind.toLowerCase())}`} to={href}>
      <div className={klass}>
        <span className="co-m-label__key">{name}</span>
        {value && <span className="co-m-label__eq">=</span>}
        {value && <span className="co-m-label__value">{value}</span>}
      </div>
    </Link>
  );
};

export const LabelList = withTranslation()(
  class LabelList extends React.Component<any> {
    shouldComponentUpdate(nextProps) {
      return !_.isEqual(nextProps, this.props);
    }

    render() {
      const { labels, kind, expand = true, t } = this.props;
      let list = _.map(labels, (label, key) => <Label key={key} kind={kind} name={key} value={label} expand={expand} />);

      if (_.isEmpty(list)) {
        list = [
          <div className="text-muted" key="0">
            {t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_110')}
          </div>,
        ];
      }

      return <div className="co-m-label-list">{list}</div>;
    }
  },
);

export type LabelProps = {
  kind: K8sResourceKindReference;
  name: string;
  value: string;
  expand: boolean;
};

export type LabelListProps = {
  labels: { [key: string]: string };
  kind: K8sResourceKindReference;
  expand?: boolean;
};
