import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

import {InstrumentService, SimpleInstrument} from '../instrument/instrument.service';
import {ObservationsService} from '../../observations.service';
import {Duration, ToastService} from '../../../shared/toast.service';
import {HelpsService} from '../../../shared/helps/helps.service';

interface Props {
  multiple?: boolean;
  percentage?: boolean;
  singleVal?: { depth: number; val: number };
  multipleVal?: Array<{ depth: number; val: number }>;
  instrument?: SimpleInstrument;
}

@Component({
  selector: 'app-oxygen',
  templateUrl: './oxygen.component.html',
  styleUrls: ['./oxygen.component.scss'],
})
export class OxygenComponent implements OnInit {
  public _props: Props = {
    singleVal: {val: undefined, depth: undefined},
    multipleVal: [{val: undefined, depth: undefined}],
    instrument: {},
  };

  constructor(
    private modalCtr: ModalController,
    private obsService: ObservationsService,
    private instrumentService: InstrumentService,
    private toastService: ToastService,
    public helpsService: HelpsService
  ) { }

  ngOnInit(): void {
    this._props.multiple =
      this.obsService.newObservation.measures.oxygen.multiple || false;
    this._props.percentage =
      this.obsService.newObservation.measures.oxygen.percentage || false;

    this.instrumentService.setInstrumentProps(this._props.instrument, 'oxygen');

    if (this.obsService.newObservation.measures.oxygen.val.length === 0) {
      return;
    }

    if (!this.obsService.newObservation.measures.oxygen.multiple) {
      this._props.singleVal = {
        val: this.obsService.newObservation.measures.oxygen.val[0].val,
        depth: this.obsService.newObservation.measures.oxygen.val[0].depth,
      };
    } else {
      this._props.multipleVal = [
        ...this.obsService.newObservation.measures.oxygen.val,
      ];
    }
  }

  onTypeChange(e: CustomEvent): void {
    this._props.multiple = e.detail.value === 'multiple';
  }

  computeStartingUnitValue(): string {
    return this._props.percentage ? 'percentage' : 'mgl';
  }

  onUnitChange(e: CustomEvent): void {
    this._props.percentage = e.detail.value === 'percentage';
  }

  async onAddBtnClick(): Promise<void> {
    if (
      this._props.multipleVal[this._props.multipleVal.length - 1].val ===
      undefined ||
      this._props.multipleVal[this._props.multipleVal.length - 1].val ===
      null ||
      this._props.multipleVal[this._props.multipleVal.length - 1].depth ===
      undefined ||
      this._props.multipleVal[this._props.multipleVal.length - 1].depth === null
    ) {
      await this.toastService.presentToast(
        'page-new-obs.measures.errors.add-measure',
        Duration.short
      );
      return;
    }

    this._props.multipleVal.push({val: undefined, depth: undefined});
  }

  async onRemoveBtnClick(): Promise<void> {
    if (this._props.multipleVal.length <= 1) {
      await this.toastService.presentToast(
        'page-new-obs.measures.errors.remove-measure',
        Duration.short
      );
      return;
    }

    this._props.multipleVal.pop();
  }

  async closeModal(save: boolean): Promise<void> {
    if (save) {
      if (!(await this.instrumentService.checkProps(this._props.instrument))) {
        return;
      }

      if (!this._props.multiple) {
        if (
          this._props.singleVal.depth === undefined ||
          this._props.singleVal.depth === null ||
          this._props.singleVal.val === undefined ||
          this._props.singleVal.val === null
        ) {
          await this.toastService.presentToast(
            'page-new-obs.measures.oxygen.error-msg-val',
            Duration.short
          );
          return;
        }

        this.obsService.newObservation.measures.oxygen.val = [
          {
            val: this._props.singleVal.val,
            depth: Math.abs(this._props.singleVal.depth),
          },
        ];
      } else {
        if (
          this._props.multipleVal.some(
            (v) =>
              v.depth === undefined ||
              v.depth === null ||
              v.val === undefined ||
              v.val === null
          )
        ) {
          await this.toastService.presentToast(
            'page-new-obs.measures.oxygen.error-msg-val',
            Duration.short
          );
          return;
        }

        this.obsService.newObservation.measures.oxygen.val = this._props.multipleVal.map(
          (v) => {
            return {val: v.val, depth: Math.abs(v.depth)};
          }
        );
      }

      this.obsService.newObservation.measures.oxygen.multiple = this._props.multiple;
      this.obsService.newObservation.measures.oxygen.percentage =
        this._props.percentage || false;
      this.obsService.newObservation.measures.oxygen.checked = true;
      this.instrumentService.saveInstrumentProps(
        this._props.instrument,
        'oxygen'
      );
    }

    await this.modalCtr.dismiss();
  }
}
