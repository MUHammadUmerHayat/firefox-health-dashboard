import React from 'react';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { selectFrom } from '../vendor/vectors';
import {
  BROWSERS, ENCODINGS, PLATFORMS, STANDARD_SIZES, TESTS, PLAYBACK_SUITES,
} from './config';
import { withNavigation } from '../vendor/components/navigation';
import Picker from '../vendor/components/navigation/Picker';
import DashboardPage from '../utils/DashboardPage';
import { PerfherderGraphContainer } from '../utils/PerfherderGraphContainer';
import { TimeDomain } from '../vendor/jx/domains';
import { timePickers } from '../utils/timePickers';

const styles = {
  chart: {
    justifyContent: 'center',
    padding: '1rem',
  },
};

class PlaybackDetails extends React.Component {
  render() {
    const {
      classes,
      navigation,
      platform,
      browser,
      encoding,
      past,
      ending,
    } = this.props;
    const timeDomain = new TimeDomain({ past, ending, interval: 'day' });
    const platformDetails = selectFrom(PLATFORMS)
      .where({ id: platform })
      .first();
    const browserDetails = selectFrom(BROWSERS)
      .where({ id: browser })
      .first();
    const missingDataInterval = browser === 'fenix' ? 7 : undefined;

    return (
      <DashboardPage
        title="Playback Details"
        key={`page_${platform}_${browser}_${encoding}_${past}_${ending}`}
      >
        {navigation}
        <Grid container spacing={1}>
          {selectFrom(STANDARD_SIZES).map(({ size }) => (
            <Grid
              item
              xs={6}
              key={`page_${platform}_${browser}_${encoding}_${size}`}
              className={classes.chart}
            >
              <PerfherderGraphContainer
                timeDomain={timeDomain}
                title={`Dropped Frames ${size}`}
                series={selectFrom(TESTS)
                  .where({
                    encoding,
                    size,
                  })
                  .map(test => {
                    const { suite } = selectFrom(PLAYBACK_SUITES).where({ variant: test.variant, browser }).first();
                    const suiteFilter = { eq: { suite } };
                    return {
                      label: `${test.speed}x`,
                      repo: browserDetails.repo,
                      filter: {
                        and: [
                          platformDetails.filter,
                          browserDetails.filter,
                          test.filter,
                          suiteFilter,
                        ],
                      },
                    };
                  })
                  .toArray()}
                missingDataInterval={missingDataInterval}
              />
            </Grid>
          ))}
        </Grid>
      </DashboardPage>
    );
  }
}

const nav = [
  {
    type: Picker,
    id: 'platform',
    label: 'Platform',
    defaultValue: 'mac',
    options: PLATFORMS,
  },
  {
    type: Picker,
    id: 'browser',
    label: 'Browser',
    defaultValue: 'firefox',
    options: BROWSERS,
  },
  {
    type: Picker,
    id: 'encoding',
    label: 'Encoding',
    defaultValue: 'VP9',
    options: selectFrom(ENCODINGS).select({
      id: 'encoding',
      label: 'encoding',
    }),
  },
  ...timePickers,
];

export default withNavigation(nav)(withStyles(styles)(PlaybackDetails));
